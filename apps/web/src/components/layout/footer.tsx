import Link from 'next/link';
import { Zap } from 'lucide-react';

export function DesignFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md gradient-brand">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-bold gradient-text">FileShift</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              关于我们
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              隐私政策
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              使用条款
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              联系我们
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">© 2024 FileShift</p>
        </div>
      </div>
    </footer>
  );
}
