import { type ReactNode } from "react";

const Header = ({ profileChip }: { profileChip?: ReactNode }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            Makaton Board
          </span>
          {profileChip}
        </div>
      </div>
    </header>
  );
};

export default Header;
