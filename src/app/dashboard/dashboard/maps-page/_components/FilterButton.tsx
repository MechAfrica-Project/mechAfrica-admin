"use client";
import { Button } from "@/components/ui/button";
import { images } from "@/lib/images";
import Image from "next/image";

export default function FilterButton() {
  return (
    <Button className="bg-[#FDFFE0] border border-[#00594C] hover:bg-[#f4f7d5] cursor-pointer text-[#00594C] flex items-center gap-2">
      Filter
      <Image src={images.cloud} alt="cloud"/>
    </Button>
  );
}
