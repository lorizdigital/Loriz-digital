import Image from "next/image";
import { cn } from "@/lib/cn";

type InquiryContactAvatarProps = {
  className?: string;
  imageSize?: string;
};

export function InquiryContactAvatar({
  className,
  imageSize = "44px",
}: InquiryContactAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-full bg-[#ded3c4] ring-1 ring-border shadow-soft",
        className,
      )}
    >
      <Image
        src="/images/lino-loriz-avatar.webp"
        alt=""
        fill
        sizes={imageSize}
        quality={80}
        className="object-cover"
      />
    </span>
  );
}
