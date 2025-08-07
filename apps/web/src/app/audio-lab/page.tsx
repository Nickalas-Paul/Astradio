import dynamic from 'next/dynamic';

// Dynamically import the client-only component with SSR disabled
const AudioClientOnlyPage = dynamic(() => import('./AudioClientOnlyPage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-300 font-mystical">Loading Audio Lab...</p>
      </div>
    </div>
  )
});

export default function AudioLabPage() {
  return <AudioClientOnlyPage />;
} 