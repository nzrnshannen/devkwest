"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MouseRippleEffectProps {
  className?: string;
  canvasId?: string;
}

const SIM_SCALE = 0.5;
const DAMPING = 0.995;
const DISPLACEMENT_SCALE = 14;

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const DROP_SHADER = `
precision highp float;

varying vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_center;
uniform float u_radius;
uniform float u_strength;

void main() {
  vec4 info = texture2D(u_texture, v_uv);
  float dist = distance(v_uv, u_center);
  float drop = cos(clamp(dist / u_radius, 0.0, 3.14159265)) * u_strength;
  info.r += drop;
  gl_FragColor = info;
}
`;

const UPDATE_SHADER = `
precision highp float;

varying vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_delta;
uniform float u_damping;

void main() {
  vec4 info = texture2D(u_texture, v_uv);

  float neighbor =
    texture2D(u_texture, vec2(v_uv.x + u_delta.x, v_uv.y)).r +
    texture2D(u_texture, vec2(v_uv.x - u_delta.x, v_uv.y)).r +
    texture2D(u_texture, vec2(v_uv.x, v_uv.y + u_delta.y)).r +
    texture2D(u_texture, vec2(v_uv.x, v_uv.y - u_delta.y)).r;

  neighbor *= 0.25;
  info.g = (info.g + (neighbor - info.r) * 2.0) * u_damping;
  info.r += info.g;
  gl_FragColor = info;
}
`;

const DISPLACEMENT_SHADER = `
precision highp float;

varying vec2 v_uv;
uniform sampler2D u_ripple;
uniform vec2 u_simResolution;
uniform float u_displacementScale;

void main() {
  vec2 texel = 1.0 / u_simResolution;
  float hR = texture2D(u_ripple, v_uv + vec2(texel.x, 0.0)).r;
  float hL = texture2D(u_ripple, v_uv - vec2(texel.x, 0.0)).r;
  float hU = texture2D(u_ripple, v_uv + vec2(0.0, texel.y)).r;
  float hD = texture2D(u_ripple, v_uv - vec2(0.0, texel.y)).r;
  vec2 offset = vec2(hR - hL, hU - hD) * u_displacementScale;
  gl_FragColor = vec4(offset.x * 0.5 + 0.5, offset.y * 0.5 + 0.5, 0.5, 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string
) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

function createTexture(
  gl: WebGLRenderingContext,
  width: number,
  height: number
) {
  const texture = gl.createTexture();
  if (!texture) return null;

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );

  return texture;
}

function createFramebuffer(
  gl: WebGLRenderingContext,
  texture: WebGLTexture
) {
  const framebuffer = gl.createFramebuffer();
  if (!framebuffer) return null;

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );

  return framebuffer;
}

export function MouseRippleEffect({
  className,
  canvasId = "mouse-ripple-canvas",
}: MouseRippleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, moved: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) return;

    const dropProgram = createProgram(gl, VERTEX_SHADER, DROP_SHADER);
    const updateProgram = createProgram(gl, VERTEX_SHADER, UPDATE_SHADER);
    const displacementProgram = createProgram(
      gl,
      VERTEX_SHADER,
      DISPLACEMENT_SHADER
    );
    if (!dropProgram || !updateProgram || !displacementProgram) return;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    let width = 0;
    let height = 0;
    let simWidth = 0;
    let simHeight = 0;
    let textureA: WebGLTexture | null = null;
    let textureB: WebGLTexture | null = null;
    let framebufferA: WebGLFramebuffer | null = null;
    let framebufferB: WebGLFramebuffer | null = null;
    let readIndex = 0;
    let animationFrame = 0;
    let pendingDrop: {
      x: number;
      y: number;
      radius: number;
      strength: number;
    } | null = null;

    const getTextures = () => {
      if (readIndex === 0) {
        return {
          read: textureA!,
          write: textureB!,
          writeFramebuffer: framebufferB!,
        };
      }
      return {
        read: textureB!,
        write: textureA!,
        writeFramebuffer: framebufferA!,
      };
    };

    const swapTextures = () => {
      readIndex = 1 - readIndex;
    };

    const bindQuad = (program: WebGLProgram) => {
      const positionLocation = gl.getAttribLocation(program, "a_position");
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.floor(window.innerWidth * dpr);
      height = Math.floor(window.innerHeight * dpr);
      simWidth = Math.max(1, Math.floor(width * SIM_SCALE));
      simHeight = Math.max(1, Math.floor(height * SIM_SCALE));

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      if (textureA) gl.deleteTexture(textureA);
      if (textureB) gl.deleteTexture(textureB);
      if (framebufferA) gl.deleteFramebuffer(framebufferA);
      if (framebufferB) gl.deleteFramebuffer(framebufferB);

      textureA = createTexture(gl, simWidth, simHeight);
      textureB = createTexture(gl, simWidth, simHeight);
      if (!textureA || !textureB) return;

      framebufferA = createFramebuffer(gl, textureA);
      framebufferB = createFramebuffer(gl, textureB);
      if (!framebufferA || !framebufferB) return;

      readIndex = 0;
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferA);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferB);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const runDropPass = () => {
      if (!pendingDrop) return;

      const { read, writeFramebuffer } = getTextures();
      const { x, y, radius, strength } = pendingDrop;
      pendingDrop = null;

      gl.bindFramebuffer(gl.FRAMEBUFFER, writeFramebuffer);
      gl.viewport(0, 0, simWidth, simHeight);
      gl.useProgram(dropProgram);
      bindQuad(dropProgram);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, read);
      gl.uniform1i(gl.getUniformLocation(dropProgram, "u_texture"), 0);
      gl.uniform2f(gl.getUniformLocation(dropProgram, "u_center"), x, y);
      gl.uniform1f(gl.getUniformLocation(dropProgram, "u_radius"), radius);
      gl.uniform1f(gl.getUniformLocation(dropProgram, "u_strength"), strength);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      swapTextures();
    };

    const runUpdatePass = () => {
      const { read, writeFramebuffer } = getTextures();

      gl.bindFramebuffer(gl.FRAMEBUFFER, writeFramebuffer);
      gl.viewport(0, 0, simWidth, simHeight);
      gl.useProgram(updateProgram);
      bindQuad(updateProgram);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, read);
      gl.uniform1i(gl.getUniformLocation(updateProgram, "u_texture"), 0);
      gl.uniform2f(
        gl.getUniformLocation(updateProgram, "u_delta"),
        1 / simWidth,
        1 / simHeight
      );
      gl.uniform1f(gl.getUniformLocation(updateProgram, "u_damping"), DAMPING);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      swapTextures();
    };

    const runDisplacementPass = () => {
      const { read } = getTextures();

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.clearColor(0.5, 0.5, 0.5, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(displacementProgram);
      bindQuad(displacementProgram);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, read);
      gl.uniform1i(gl.getUniformLocation(displacementProgram, "u_ripple"), 0);
      gl.uniform2f(
        gl.getUniformLocation(displacementProgram, "u_simResolution"),
        simWidth,
        simHeight
      );
      gl.uniform1f(
        gl.getUniformLocation(displacementProgram, "u_displacementScale"),
        DISPLACEMENT_SCALE
      );

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const render = () => {
      if (mouseRef.current.moved) {
        pendingDrop = {
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          radius: 0.035,
          strength: 0.12,
        };
        mouseRef.current.moved = false;
      }

      runDropPass();
      runUpdatePass();
      runDisplacementPass();
      animationFrame = window.requestAnimationFrame(render);
    };

    const addRipple = (
      clientX: number,
      clientY: number,
      strength: number,
      radius: number
    ) => {
      mouseRef.current.x = clientX / window.innerWidth;
      mouseRef.current.y = 1 - clientY / window.innerHeight;
      pendingDrop = {
        x: mouseRef.current.x,
        y: mouseRef.current.y,
        radius,
        strength,
      };
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = event.clientX / window.innerWidth;
      mouseRef.current.y = 1 - event.clientY / window.innerHeight;
      mouseRef.current.moved = true;
    };

    const handleMouseDown = (event: MouseEvent) => {
      addRipple(event.clientX, event.clientY, 0.55, 0.06);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      handleMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as MouseEvent);
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      addRipple(touch.clientX, touch.clientY, 0.45, 0.055);
    };

    resize();
    animationFrame = window.requestAnimationFrame(render);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchStart);

      if (textureA) gl.deleteTexture(textureA);
      if (textureB) gl.deleteTexture(textureB);
      if (framebufferA) gl.deleteFramebuffer(framebufferA);
      if (framebufferB) gl.deleteFramebuffer(framebufferB);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(dropProgram);
      gl.deleteProgram(updateProgram);
      gl.deleteProgram(displacementProgram);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id={canvasId}
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-0 h-full w-full opacity-0",
        className
      )}
    />
  );
}
