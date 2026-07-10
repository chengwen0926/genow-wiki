"use client";

import { useEffect } from "react";

const SHADER_CORE = "#f5fbff";
const SHADER_FRINGE = "#4a88ff";

export function useShaderBackground(
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationId = 0;
    let renderer: import("three").WebGLRenderer | null = null;

    import("three").then((THREE) => {
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const geometry = new THREE.PlaneGeometry(2, 2);

      const vertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform vec3 u_colorCore;
        uniform vec3 u_colorFringe;
        varying vec2 vUv;

        vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
          m = m * m;
          m = m * m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 a0 = x - floor(x + 0.5);
          m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
          vec3 g;
          g.x = a0.x * x0.x + h.x * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          vec2 st = uv;
          st.x *= u_resolution.x / u_resolution.y;
          st += (u_mouse - 0.5) * 0.04;

          float t = u_time;
          float gridSize = 50.0;
          vec2 gridSt = fract(st * gridSize);
          vec2 id = floor(st * gridSize);

          float n1 = snoise(id * 0.046 + vec2(t * 0.09, t * 0.15));
          float n2 = snoise(id * 0.021 + vec2(-t * 0.05, t * 0.04));
          float intensity = clamp((n1 + n2) * 0.5 + 0.5, 0.0, 1.0);

          float d = distance(gridSt, vec2(0.5));
          float radius = smoothstep(0.08, 0.92, intensity) * 0.348;
          float circle = 1.0 - smoothstep(radius - 0.04, radius + 0.04, d);

          vec3 color = mix(u_colorFringe, u_colorCore, intensity);
          float alpha = circle * 0.58;

          gl_FragColor = vec4(color * circle, alpha);
        }
      `;

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          u_time: { value: 0.0 },
          u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
          u_colorCore: { value: new THREE.Color(SHADER_CORE) },
          u_colorFringe: { value: new THREE.Color(SHADER_FRINGE) },
        },
        transparent: true,
        blending: THREE.NormalBlending,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const targetMouse = new THREE.Vector2(0.5, 0.5);
      const onMouseMove = (event: MouseEvent) => {
        targetMouse.x = event.clientX / window.innerWidth;
        targetMouse.y = 1.0 - event.clientY / window.innerHeight;
      };
      document.addEventListener("mousemove", onMouseMove);

      const clock = new THREE.Clock();
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        material.uniforms.u_time.value = clock.getElapsedTime();
        material.uniforms.u_mouse.value.lerp(targetMouse, 0.05);
        renderer?.render(scene, camera);
      };
      animate();

      const onResize = () => {
        renderer?.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", onResize);

      (container as HTMLDivElement & { cleanup?: () => void }).cleanup = () => {
        cancelAnimationFrame(animationId);
        document.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        renderer?.dispose();
        if (renderer && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    });

    return () => {
      (container as HTMLDivElement & { cleanup?: () => void }).cleanup?.();
    };
  }, [containerRef]);
}

