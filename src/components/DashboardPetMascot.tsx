import { Box, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useEffect, useRef } from 'react';

import { useAppSelector } from '../features/auth/hooks';
import { playBark, playMeow, resumeDashboardAudio } from '../utils/dashboardPetSounds';

/**
 * Full-height dashboard companion: Three.js loads dynamically. Perspective render, physical materials,
 * soft lighting, pedestal, idle motion, gaze + click sound.
 */
export default function DashboardPetMascot() {
  const theme = useTheme();
  const mascot = useAppSelector((s) => s.ui.dashboardMascot);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf = 0;
    let cleanupThree: (() => void) | undefined;
    let ro: ResizeObserver | undefined;

    const mouse = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };

    const onMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      if (rect.width < 16 || rect.height < 16) return;
      mouse.x = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
      mouse.y = Math.max(-1, Math.min(1, -((e.clientY - rect.top) / rect.height) * 2 + 1));
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const isCat = mascot === 'cat';

    void import('three').then((THREE) => {
      if (disposed || !mountRef.current) return;

      const scene = new THREE.Scene();
      const bg = isDark ? 0x141824 : 0xf0f4ff;
      scene.background = new THREE.Color(bg);
      scene.fog = new THREE.Fog(bg, 2.8, 6.5);

      const camera = new THREE.PerspectiveCamera(38, 1, 0.08, 24);
      camera.position.set(0, 0.52, 2.45);
      camera.lookAt(0, 0.28, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = isDark ? 1.02 : 1.12;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.borderRadius = 'inherit';
      renderer.domElement.tabIndex = 0;
      renderer.domElement.setAttribute(
        'aria-label',
        isCat ? 'Studio companion cat — move the pointer; click to meow' : 'Studio companion dog — move the pointer; click to bark',
      );
      mount.appendChild(renderer.domElement);

      scene.add(new THREE.HemisphereLight(isDark ? 0x8a9ec4 : 0xffffff, isDark ? 0x1a1a24 : 0xffe8d0, 0.55));
      const sun = new THREE.DirectionalLight(0xfff5e6, isDark ? 0.55 : 0.95);
      sun.position.set(2.2, 4.2, 3.2);
      sun.castShadow = true;
      sun.shadow.mapSize.setScalar(1024);
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 12;
      sun.shadow.camera.left = -2;
      sun.shadow.camera.right = 2;
      sun.shadow.camera.top = 2;
      sun.shadow.camera.bottom = -2;
      scene.add(sun);

      const rim = new THREE.DirectionalLight(0xa8c4ff, isDark ? 0.22 : 0.35);
      rim.position.set(-3.2, 1.8, -1.5);
      scene.add(rim);

      const fill = new THREE.PointLight(0xffd4a8, isDark ? 0.15 : 0.28, 6, 1.8);
      fill.position.set(-0.6, 1.1, 1.8);
      scene.add(fill);

      const stage = new THREE.Group();
      scene.add(stage);

      const podium = new THREE.Mesh(
        new THREE.CylinderGeometry(0.58, 0.66, 0.11, 56, 1),
        new THREE.MeshPhysicalMaterial({
          color: isDark ? 0x2a3148 : 0xffffff,
          roughness: 0.35,
          metalness: 0.08,
          clearcoat: 0.55,
          clearcoatRoughness: 0.18,
        }),
      );
      podium.receiveShadow = true;
      podium.position.y = -0.02;
      stage.add(podium);

      const pet = new THREE.Group();
      pet.position.set(0, 0.12, 0);
      stage.add(pet);

      const fur = (hex: number, rough = 0.55, clear = 0.28) =>
        new THREE.MeshPhysicalMaterial({
          color: hex,
          roughness: rough,
          metalness: 0.02,
          clearcoat: clear,
          clearcoatRoughness: 0.22,
        });

      const bodyMat = fur(isCat ? 0xff9a56 : 0xc08952, 0.48, 0.32);
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.38, 8, 24), bodyMat);
      body.castShadow = true;
      body.receiveShadow = true;
      body.rotation.z = isCat ? 0.06 : -0.04;
      body.position.set(0, 0.42, 0);
      pet.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 36, 32), bodyMat);
      head.castShadow = true;
      head.position.set(0, 0.78, 0.08);
      head.scale.set(1.05, 0.92, 0.88);
      pet.add(head);

      const earOuter = isCat ? 0xff7a3c : 0x9e6638;
      const earInner = isCat ? 0xffb4c8 : 0xf0c8a8;

      if (isCat) {
        for (const sign of [-1, 1] as const) {
          const earG = new THREE.Group();
          earG.position.set(sign * 0.28, 1.02, 0.02);
          earG.rotation.z = sign * 0.32;
          const outer = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.32, 12, 1, false), fur(earOuter, 0.42, 0.4));
          outer.castShadow = true;
          const inner = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 10, 1, false), fur(earInner, 0.55, 0.15));
          inner.position.set(0, -0.02, 0.04);
          earG.add(outer, inner);
          pet.add(earG);
        }
        const tail = new THREE.Mesh(
          new THREE.TorusGeometry(0.14, 0.038, 10, 28, Math.PI * 1.35),
          fur(0xff8f4a, 0.5, 0.25),
        );
        tail.position.set(-0.32, 0.38, -0.18);
        tail.rotation.set(0.5, 0.2, -0.8);
        tail.castShadow = true;
        pet.add(tail);
      } else {
        for (const sign of [-1, 1] as const) {
          const ear = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 18), fur(earOuter, 0.45, 0.3));
          ear.scale.set(1.2, 0.55, 0.55);
          ear.position.set(sign * 0.36, 0.88, -0.02);
          ear.rotation.z = sign * 0.95;
          ear.castShadow = true;
          pet.add(ear);
          const inner = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), fur(earInner, 0.6, 0.1));
          inner.scale.set(1, 0.6, 0.5);
          inner.position.set(sign * 0.36, 0.88, 0.04);
          pet.add(inner);
        }
        const snout = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 22, 20),
          fur(0xe8c4a0, 0.42, 0.2),
        );
        snout.scale.set(1, 0.72, 0.85);
        snout.position.set(0, 0.62, 0.38);
        snout.castShadow = true;
        pet.add(snout);
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), fur(0x3d2918, 0.35, 0.5));
        nose.position.set(0, 0.58, 0.52);
        pet.add(nose);
        const collarMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(theme.palette.primary.main),
          roughness: 0.35,
          metalness: 0.15,
          clearcoat: 0.6,
        });
        const collar = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 12, 40), collarMat);
        collar.rotation.x = Math.PI / 2;
        collar.position.set(0, 0.52, 0.02);
        pet.add(collar);
      }

      if (isCat) {
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 12), fur(0xff8ec8, 0.35, 0.45));
        nose.scale.set(1, 0.75, 0.65);
        nose.position.set(0, 0.66, 0.42);
        pet.add(nose);
      }

      const pupils: import('three').Mesh[] = [];

      for (const sign of [-1, 1] as const) {
        const eyeG = new THREE.Group();
        eyeG.position.set(sign * 0.14, 0.78, 0.34);
        const sclera = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 22, 20),
          new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            roughness: 0.12,
            metalness: 0,
            transmission: 0,
            thickness: 0,
            clearcoat: 0.85,
            clearcoatRoughness: 0.08,
          }),
        );
        sclera.scale.set(1.05, 1.12, 0.55);
        const iris = new THREE.Mesh(
          new THREE.SphereGeometry(0.055, 16, 14),
          new THREE.MeshPhysicalMaterial({
            color: isCat ? 0x4ade80 : 0x38bdf8,
            roughness: 0.25,
            metalness: 0.05,
            clearcoat: 0.5,
          }),
        );
        iris.position.z = 0.038;
        const pupil = new THREE.Mesh(
          new THREE.SphereGeometry(0.034, 14, 12),
          new THREE.MeshPhysicalMaterial({ color: 0x0a0a12, roughness: 0.35, metalness: 0.05 }),
        );
        pupil.position.z = 0.06;
        const hi = new THREE.Mesh(
          new THREE.SphereGeometry(0.014, 10, 8),
          new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0, emissive: 0xffffff, emissiveIntensity: 0.35 }),
        );
        hi.position.set(sign * 0.02, 0.024, 0.018);
        pupil.add(hi);
        eyeG.add(sclera, iris, pupil);
        pupils.push(pupil);
        pet.add(eyeG);
      }

      const play = async () => {
        try {
          const ctx = await resumeDashboardAudio();
          if (isCat) playMeow(ctx);
          else playBark(ctx);
        } catch {
          /* autoplay */
        }
      };

      const onClick = () => void play();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          void play();
        }
      };
      renderer.domElement.addEventListener('click', onClick);
      renderer.domElement.addEventListener('keydown', onKey);

      const resize = () => {
        const w = Math.max(120, mount.clientWidth);
        const h = Math.max(200, mount.clientHeight);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      };
      ro = new ResizeObserver(() => resize());
      ro.observe(mount);
      resize();

      const disposeSceneMeshes = () => {
        scene.traverse((child: import('three').Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            const m = child.material;
            if (Array.isArray(m)) m.forEach((x) => x.dispose());
            else m.dispose();
          }
        });
      };

      const t0 = performance.now();
      const loop = () => {
        if (disposed) return;
        const t = (performance.now() - t0) / 1000;
        smooth.x += (mouse.x - smooth.x) * 0.11;
        smooth.y += (mouse.y - smooth.y) * 0.11;
        const px = THREE.MathUtils.clamp(smooth.x * 0.055, -0.038, 0.038);
        const py = THREE.MathUtils.clamp(smooth.y * 0.048, -0.032, 0.032);
        pupils.forEach((pupil) => {
          pupil.position.x = px;
          pupil.position.y = py;
        });
        pet.position.y = 0.12 + Math.sin(t * 1.6) * 0.018;
        pet.rotation.y = smooth.x * 0.22 + Math.sin(t * 0.45) * 0.04;
        pet.rotation.x = THREE.MathUtils.clamp(-smooth.y * 0.12 + Math.sin(t * 1.1) * 0.02, -0.2, 0.18);

        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
      };
      loop();

      cleanupThree = () => {
        cancelAnimationFrame(raf);
        ro?.disconnect();
        renderer.domElement.removeEventListener('click', onClick);
        renderer.domElement.removeEventListener('keydown', onKey);
        disposeSceneMeshes();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      window.removeEventListener('mousemove', onMove);
      cleanupThree?.();
      mount.innerHTML = '';
    };
  }, [mascot, isDark, theme.palette.primary.main]);

  return (
    <Stack spacing={1} sx={{ height: '100%', minHeight: 0 }}>
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
          Studio companion
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.45 }}>
          {mascot === 'cat' ? 'Curious cat' : 'Loyal pup'} — eyes follow your cursor. Click for a tiny sound. Change species in{' '}
          <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Settings
          </Box>
          .
        </Typography>
      </Box>
      <Box
        ref={mountRef}
        sx={{
          flex: 1,
          minHeight: { xs: 280, sm: 320, md: 360 },
          width: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          border: (t) => `1px solid ${alpha(t.palette.divider, 0.14)}`,
          bgcolor: (t) => alpha(t.palette.primary.main, t.palette.mode === 'light' ? 0.04 : 0.08),
          cursor: 'pointer',
          '&:focus-within': {
            outline: (t) => `2px solid ${alpha(t.palette.primary.main, 0.45)}`,
            outlineOffset: 2,
          },
        }}
      />
    </Stack>
  );
}
