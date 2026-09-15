"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

const vertexShader = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  uniform vec2 resolution;
  uniform float time;

  mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  float field(vec2 point, float t) {
    point *= rotate(0.28 + sin(t * 0.12) * 0.06);
    float waveA = sin(point.x * 2.25 + point.y * 1.35 + t * 0.72);
    float waveB = sin(point.y * 3.4 - point.x * 1.18 - t * 0.54);
    float waveC = sin((point.x + point.y) * 2.0 + t * 0.36);
    return waveA + waveB * 0.68 + waveC * 0.42;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 point = uv - 0.5;
    point.x *= resolution.x / resolution.y;
    float t = time * 0.00042;

    float flow = field(point * 2.1, t);
    vec2 warped = point + vec2(sin(flow + t), cos(flow - t * 0.8)) * 0.075;
    float silk = field(warped * 2.9, t * 1.12);
    float ribbon = smoothstep(0.72, 1.25, sin(silk * 1.45 + flow * 0.45));
    float bloom = smoothstep(1.16, 0.12, length(point - vec2(0.48, 0.03))) * 0.72;
    float ember = smoothstep(1.28, 0.18, length(point - vec2(-0.45, -0.32))) * 0.38;
    float grain = fract(sin(dot(gl_FragCoord.xy + time, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;

    vec3 ink = vec3(0.028, 0.023, 0.018);
    vec3 merlot = vec3(0.20, 0.045, 0.052);
    vec3 bronze = vec3(0.54, 0.30, 0.09);
    vec3 champagne = vec3(0.93, 0.72, 0.34);
    vec3 color = mix(ink, merlot, smoothstep(-1.55, 1.25, flow) * 0.46);
    color += bronze * (ribbon * 0.32 + ember * 0.33);
    color += champagne * (bloom * 0.29 + ribbon * bloom * 0.16);
    color += grain * 0.018;
    float vignette = smoothstep(1.36, 0.20, length(point * vec2(0.92, 1.16)));
    gl_FragColor = vec4(color * (0.55 + vignette * 0.45), 1.0);
  }
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export default function Hero() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const gl = element.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;
    const vertex = compile(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vertex || !fragment) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    if (!buffer) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "resolution");
    const time = gl.getUniformLocation(program, "time");
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      element.width = Math.round(element.clientWidth * scale);
      element.height = Math.round(element.clientHeight * scale);
      gl.viewport(0, 0, element.width, element.height);
    };
    const render = (now: number) => {
      gl.uniform2f(resolution, element.width, element.height);
      gl.uniform1f(time, now);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!preference.matches && document.visibilityState === "visible") {
        frame = requestAnimationFrame(render);
      }
    };
    const playIfNeeded = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(render);
    };
    const observer = new ResizeObserver(() => {
      resize();
      playIfNeeded();
    });
    observer.observe(element);
    preference.addEventListener("change", playIfNeeded);
    document.addEventListener("visibilitychange", playIfNeeded);
    resize();
    playIfNeeded();

    return () => {
      observer.disconnect();
      preference.removeEventListener("change", playIfNeeded);
      document.removeEventListener("visibilitychange", playIfNeeded);
      cancelAnimationFrame(frame);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  return (
    <section className="hero hero-webgl">
      <canvas className="hero-webgl-canvas" ref={canvas} aria-hidden="true" />
      <div className="hero-shade" />
      <div className="container hero-content">
        <p className="eyebrow">Strike A Pose · Photo Booth & Party Services</p>
        <h1>
          Make Your Event
          <br />
          <em>Unforgettable.</em>
        </h1>
        <p className="hero-description">
          Premium photo booth and event experiences that bring your celebration
          to life.
        </p>
        <p className="occasions">
          Weddings • Birthdays • Baby Showers • Bar & Bat Mitzvahs •
          Graduations • Corporate Events & More
        </p>
        <div className="button-row">
          <Link href="/contact" className="button gold">
            Book Now <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/services" className="button button-outline">
            Explore Our Experiences
          </Link>
        </div>
      </div>
      <div className="hero-caption">
        Good company. Great memories. <span>Strike a pose.</span>
      </div>
    </section>
  );
}
