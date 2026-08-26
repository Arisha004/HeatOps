import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Shield,
  Lock,
  Mail,
  User,
  Building2,
  MapPin,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  Briefcase
} from 'lucide-react';
import { Logo } from './Logo';
import { supabase, isSupabaseConfigured, setStoredLocalUser, AuthProfile } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (profile: AuthProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('L&T Infrastructure — Dwarka Expressway');
  const [siteRegion, setSiteRegion] = useState('US Southwest (AZ & NV)');
  const [role, setRole] = useState<'hse_lead' | 'site_supervisor' | 'contractor_lead'>('hse_lead');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // 3D Background Canvas - Clean Warm Orange / Frosted Core for White Glassmorphism
  useEffect(() => {
    if (!isOpen || !canvasContainerRef.current) return;
    const container = canvasContainerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.replaceChildren(renderer.domElement);

    // 3D Isometric Thermal Shield Wireframe (Warm Orange & Amber for Light Mode)
    const shieldGroup = new THREE.Group();
    scene.add(shieldGroup);

    // Outer Shield
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 1.25);
    shieldShape.lineTo(0.95, 0.75);
    shieldShape.lineTo(0.95, -0.25);
    shieldShape.lineTo(0, -1.25);
    shieldShape.lineTo(-0.95, -0.25);
    shieldShape.lineTo(-0.95, 0.75);
    shieldShape.closePath();

    const extrudeSettings = {
      depth: 0.18,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    };
    const shieldGeom = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    const shieldMat = new THREE.MeshPhysicalMaterial({
      color: 0xf97316,
      emissive: 0xffedd5,
      emissiveIntensity: 0.2,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.6,
      ior: 1.4,
      transparent: true,
      opacity: 0.35,
    });
    const shieldMesh = new THREE.Mesh(shieldGeom, shieldMat);
    shieldMesh.position.z = -0.09;
    shieldGroup.add(shieldMesh);

    // Outer Vibrant Orange Torus Ring
    const ringGeom = new THREE.TorusGeometry(1.45, 0.025, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.55,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    shieldGroup.add(ring);

    // Secondary Amber Core Ring
    const innerRingGeom = new THREE.TorusGeometry(1.05, 0.02, 16, 64);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.65,
    });
    const innerRing = new THREE.Mesh(innerRingGeom, innerRingMat);
    innerRing.rotation.x = Math.PI / 3;
    shieldGroup.add(innerRing);

    // Tertiary Accent Ring
    const accentRingGeom = new THREE.TorusGeometry(0.7, 0.015, 16, 64);
    const accentRingMat = new THREE.MeshBasicMaterial({
      color: 0xea580c,
      transparent: true,
      opacity: 0.45,
    });
    const accentRing = new THREE.Mesh(accentRingGeom, accentRingMat);
    accentRing.rotation.y = Math.PI / 4;
    shieldGroup.add(accentRing);

    // Floating particle field (Warm orange & golden dust)
    const particleCount = 140;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 6;
      particlePositions[i + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i + 2] = (Math.random() - 0.5) * 3;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf97316,
      size: 0.045,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.5);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const warmOrangeLight = new THREE.PointLight(0xf97316, 4, 10);
    warmOrangeLight.position.set(-2, 2, 2);
    scene.add(warmOrangeLight);

    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;

      shieldGroup.rotation.y = elapsed * 0.35;
      shieldGroup.rotation.x = Math.sin(elapsed * 0.3) * 0.12;
      innerRing.rotation.z = elapsed * 0.5;
      accentRing.rotation.x = elapsed * 0.4;

      particles.rotation.y = elapsed * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!canvasContainerRef.current) return;
      const w = canvasContainerRef.current.clientWidth;
      const h = canvasContainerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQuickDemoLogin = (selectedRole: 'hse_lead' | 'site_supervisor' | 'contractor_lead') => {
    setIsLoading(true);
    setErrorMessage(null);

    const demoProfiles: Record<string, AuthProfile> = {
      hse_lead: {
        id: 'usr_hse_8849',
        email: 'hse.director@sunbeltinfra.com',
        fullName: 'Dana Whitfield',
        role: 'hse_lead',
        organization: 'Sun Belt Highways & Infrastructure LLC',
        siteRegion: 'Maricopa Zone 4 & Loop 202 Corridor',
      },
      site_supervisor: {
        id: 'usr_sup_2910',
        email: 'supervisor.morgan@granitehc.com',
        fullName: 'Morgan Reyes',
        role: 'site_supervisor',
        organization: 'Granite Heavy Civil — Package 111',
        siteRegion: 'Loop 303 Expressway Package 2',
      },
      contractor_lead: {
        id: 'usr_cont_1048',
        email: 'operations@cactussteel.com',
        fullName: 'Casey Nolan',
        role: 'contractor_lead',
        organization: 'Cactus Structural Reinforcement',
        siteRegion: 'Western Urban Ring Road',
      },
    };

    setTimeout(() => {
      const profile = demoProfiles[selectedRole];
      setStoredLocalUser(profile);
      setIsLoading(false);
      onAuthSuccess(profile);
      onClose();
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === 'forgot') {
        if (!email) {
          setErrorMessage('Please enter your work email address.');
          setIsLoading(false);
          return;
        }

        if (supabase && isSupabaseConfigured) {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
          });
          if (error) throw error;
        }

        setSuccessMessage(
          'Password reset instructions have been sent to your work email.');
        setIsLoading(false);
        return;
      }

      if (mode === 'signup') {
        if (!email || !password || !fullName) {
          setErrorMessage(
            'Please fill in all required fields.');
          setIsLoading(false);
          return;
        }

        let userId = 'usr_' + Math.random().toString(36).substring(2, 9);

        if (supabase && isSupabaseConfigured) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                organization,
                site_region: siteRegion,
                role,
              },
            },
          });
          if (error) throw error;
          if (data.user) {
            userId = data.user.id;
          }
        }

        const profile: AuthProfile = {
          id: userId,
          email,
          fullName,
          role,
          organization,
          siteRegion,
        };

        setStoredLocalUser(profile);
        setSuccessMessage(
          'Account created successfully. Signing you in...');
        setTimeout(() => {
          setIsLoading(false);
          onAuthSuccess(profile);
          onClose();
        }, 500);
        return;
      }

      // Sign In mode
      if (!email || !password) {
        setErrorMessage(
          'Please enter your email and password.');
        setIsLoading(false);
        return;
      }

      let userId = 'usr_' + Math.random().toString(36).substring(2, 9);
      let profileName = fullName || email.split('@')[0];

      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          userId = data.user.id;
          profileName = data.user.user_metadata?.full_name || profileName;
        }
      }

      const profile: AuthProfile = {
        id: userId,
        email,
        fullName: profileName,
        role,
        organization,
        siteRegion,
      };

      setStoredLocalUser(profile);
      setIsLoading(false);
      onAuthSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error('Supabase auth error:', err);
      setErrorMessage(
        err.message || ('Authentication failed. Please verify your credentials.')
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      {/* Outer White Glassmorphism Container with 3D Background */}
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white/95 backdrop-blur-2xl rounded-2xl border border-neutral-200/80 shadow-2xl flex flex-col">
        
        {/* 3D Background Canvas (Rotating Warm Orange Iso-Shield) */}
        <div
          ref={canvasContainerRef}
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* Ambient Top Subtle Accent Stripe */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 z-30" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-white/90 hover:bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Content */}
        <div className="relative z-20 p-6 sm:p-7 pb-3">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Logo size={32} showText />
            
            {/* Supabase Status Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-medium text-neutral-700">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-orange-500'}`} />
              <span>{isSupabaseConfigured ? 'Supabase Auth' : 'Live Authentication'}</span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-neutral-100 rounded-xl border border-neutral-200/70 mb-3 max-w-xs">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/60'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/60'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Create Account
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
            {mode === 'signin' && ('Sign in to HeatOps')}
            {mode === 'signup' && ('Create your enterprise account')}
            {mode === 'forgot' && ('Reset your password')}
          </h2>
          <p className="text-xs text-neutral-600 mt-0.5">
            {mode === 'signin' && ('Enter your work credentials to access site thermal safety reports.')}
            {mode === 'signup' && ('Set up an authorized HSE supervisor or contractor account.')}
            {mode === 'forgot' && ('Enter your registered work email to receive password reset instructions.')}
          </p>
        </div>

        {/* Demo Fast-Track Selector */}
        {mode === 'signin' && (
          <div className="relative z-20 mx-6 sm:mx-7 mb-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
            <div className="flex items-center justify-between text-[11px] mb-1.5 text-neutral-600 font-medium">
              <span className="flex items-center gap-1 text-neutral-800 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Demo Profiles
              </span>
              <span className="text-[10px] text-neutral-500">Fast-Track Sign-In</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('hse_lead')}
                className="px-2 py-1.5 rounded-lg bg-white hover:bg-neutral-100 text-neutral-800 text-[11px] font-medium border border-neutral-200 transition-all text-center truncate cursor-pointer"
              >
                HSE Lead
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('site_supervisor')}
                className="px-2 py-1.5 rounded-lg bg-white hover:bg-neutral-100 text-neutral-800 text-[11px] font-medium border border-neutral-200 transition-all text-center truncate cursor-pointer"
              >
                Supervisor
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('contractor_lead')}
                className="px-2 py-1.5 rounded-lg bg-white hover:bg-neutral-100 text-neutral-800 text-[11px] font-medium border border-neutral-200 transition-all text-center truncate cursor-pointer"
              >
                Contractor
              </button>
            </div>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="relative z-20 px-6 sm:px-7 pb-6 space-y-3 flex-1">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Full Name & Organization (Signup Mode) */}
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Rathore"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Organization
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all cursor-pointer"
                  >
                    <option value="hse_lead">HSE Safety Lead</option>
                    <option value="site_supervisor">Site Shift Supervisor</option>
                    <option value="contractor_lead">General Contractor</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-700">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-neutral-500 hover:text-neutral-900 font-medium hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2 shadow-xs"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'signin' && ('Sign In')}
                  {mode === 'signup' && ('Create Account')}
                  {mode === 'forgot' && ('Send Reset Link')}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {/* Toggle between Signin & Signup */}
          <div className="pt-2 text-center text-xs text-neutral-600">
            {mode === 'signin' ? (
              <span>
                {"Don't have an account? "}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-neutral-900 font-semibold hover:underline ml-1 cursor-pointer"
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                {'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-neutral-900 font-semibold hover:underline ml-1 cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
