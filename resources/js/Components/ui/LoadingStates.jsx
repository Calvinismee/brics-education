
import { useEffect, useState } from 'react';
import BricsLogo from '../BricsLogo';

const LOADING_SPINNER_DELAY = 1000;
const LOADING_PROGRESS_DELAY = 10000;

export function useStagedLoading(isLoading, {
	spinnerDelay = LOADING_SPINNER_DELAY,
	progressDelay = LOADING_PROGRESS_DELAY,
} = {}) {
	const [stage, setStage] = useState('idle');

	useEffect(() => {
		if (!isLoading) {
			setStage('idle');
			return undefined;
		}

		setStage('idle');

		const spinnerTimer = window.setTimeout(() => setStage('spinner'), spinnerDelay);
		const progressTimer = window.setTimeout(() => setStage('progress'), progressDelay);

		return () => {
			window.clearTimeout(spinnerTimer);
			window.clearTimeout(progressTimer);
		};
	}, [isLoading, spinnerDelay, progressDelay]);

	return {
		stage,
		showSpinner: isLoading && stage === 'spinner',
		showProgress: isLoading && stage === 'progress',
		showFeedback: isLoading && stage !== 'idle',
	};
}

function Shimmer({ className = '' }) {
	return (
		<div
			className={`rounded-lg ${className}`}
			style={{
				background: 'linear-gradient(90deg, #E8E3D8 25%, #D8D7BE 50%, #E8E3D8 75%)',
				backgroundSize: '200% 100%',
				animation: 'bricsShimmer 1.6s ease-in-out infinite',
			}}
		/>
	);
}

if (typeof document !== 'undefined' && !document.getElementById('brics-shimmer-style')) {
	const styleTag = document.createElement('style');
	styleTag.id = 'brics-shimmer-style';
	styleTag.textContent = `
		@keyframes bricsShimmer {
			0% { background-position: 200% 0; }
			100% { background-position: -200% 0; }
		}
		@keyframes bricsSpin {
			to { transform: rotate(360deg); }
		}
		@keyframes bricsBounce {
			0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
			40% { transform: scale(1); opacity: 1; }
		}
		@keyframes bricsPulseRing {
			0% { transform: scale(0.85); opacity: 1; }
			70% { transform: scale(1.15); opacity: 0; }
			100% { transform: scale(0.85); opacity: 0; }
		}
		@keyframes bricsProgressIndeterminate {
			0% { transform: translateX(-100%); }
			100% { transform: translateX(250%); }
		}
	`;
	document.head.appendChild(styleTag);
}

const spinnerSizes = {
	xs: 'w-4 h-4 border-[2px]',
	sm: 'w-6 h-6 border-[2.5px]',
	md: 'w-8 h-8 border-[3px]',
	lg: 'w-12 h-12 border-[3.5px]',
	xl: 'w-16 h-16 border-[4px]',
};

export function Spinner({ size = 'md', color = '#691D1B' }) {
	return (
		<div
			className={`rounded-full ${spinnerSizes[size]}`}
			style={{
				borderColor: `${color}25`,
				borderTopColor: color,
				animation: 'bricsSpin 0.75s linear infinite',
				flexShrink: 0,
			}}
		/>
	);
}

export function BouncingDots({ color = '#691D1B' }) {
	return (
		<div className="flex items-center gap-1.5">
			{[0, 1, 2].map((i) => (
				<div
					key={i}
					className="w-2 h-2 rounded-full"
					style={{
						background: color,
						animation: `bricsBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
					}}
				/>
			))}
		</div>
	);
}

export function InlineLoader({ label = 'Memuat...', size = 'sm' }) {
	return (
		<div className="flex items-center gap-2">
			<Spinner size={size} />
			<span className="text-sm text-gray-500" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
				{label}
			</span>
		</div>
	);
}

export function IndeterminateProgressBar({ color = '#691D1B' }) {
	return (
		<div className="h-1 w-full overflow-hidden rounded-full" style={{ background: `${color}25` }}>
			<div
				className="h-full w-1/3 rounded-full"
				style={{
					background: color,
					animation: 'bricsProgressIndeterminate 1.2s ease-in-out infinite',
				}}
			/>
		</div>
	);
}

export function StagedLoadingContent({
	loading,
	children,
	loadingLabel = 'Memproses...',
	longLoadingLabel = 'Masih memproses...',
	spinnerColor = '#FFE882',
	progressColor = '#FFE882',
	spinnerSize = 'xs',
}) {
	const loadingState = useStagedLoading(loading);

	if (!loading || loadingState.stage === 'idle') {
		return children;
	}

	if (loadingState.showProgress) {
		return (
			<span className="flex w-full min-w-0 max-w-full flex-col items-center gap-1.5">
				<span className="text-center leading-tight">{longLoadingLabel}</span>
				<IndeterminateProgressBar color={progressColor} />
			</span>
		);
	}

	return (
		<span className="flex items-center justify-center gap-2">
			<Spinner size={spinnerSize} color={spinnerColor} />
			{loadingLabel}
		</span>
	);
}

export function BricsPageLoader({ message = 'Memuat...' }) {
	return (
		<div
			className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
			style={{ background: '#F7F2E7', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
		>
			<div className="relative flex items-center justify-center">
				<div
					className="absolute w-24 h-24 rounded-full"
					style={{
						border: '2px solid #691D1B',
						animation: 'bricsPulseRing 1.8s ease-out infinite',
					}}
				/>
				<div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'background' }}>
					<BricsLogo variant="light" size="sm" />
				</div>
			</div>

			<div className="flex flex-col items-center gap-3">
				<div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: '#D8D7BE' }}>
					<div
						className="h-full rounded-full"
						style={{
							width: '60%',
							background: '#691D1B',
							animation: 'bricsShimmer 1.8s ease-in-out infinite',
							backgroundSize: '200% 100%',
						}}
					/>
				</div>
				<p className="text-sm text-gray-500" style={{ fontWeight: 500 }}>
					{message}
				</p>
			</div>
		</div>
	);
}

export function LoadingButton({ label = 'Memproses...', idleLabel = null, longLabel = 'Masih memproses...', variant = 'primary' }) {
	const isPrimary = variant === 'primary';
	const loadingState = useStagedLoading(true);

	return (
		<button
			disabled
			className="flex max-w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm cursor-not-allowed opacity-80 transition-all"
			style={{
				background: isPrimary ? '#691D1B' : '#F7F2E7',
				color: isPrimary ? '#FFE882' : '#691D1B',
				fontWeight: 700,
				fontFamily: "'Plus Jakarta Sans', sans-serif",
			}}
		>
			{loadingState.showProgress ? (
				<span className="flex w-full min-w-0 max-w-full flex-col items-center gap-1.5">
					<span className="text-center leading-tight">{longLabel}</span>
					<IndeterminateProgressBar color={isPrimary ? '#FFE882' : '#691D1B'} />
				</span>
			) : loadingState.showSpinner ? (
				<>
					<Spinner size="xs" color={isPrimary ? '#FFE882' : '#691D1B'} />
					{label}
				</>
			) : (
				idleLabel ?? label
			)}
		</button>
	);
}
