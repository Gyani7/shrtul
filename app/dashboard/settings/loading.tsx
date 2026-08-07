import { Spinner } from '@/components/ui/spinner';

export default function SettingsLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="h-8 w-8" />
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    </div>
  );
}
