import { Progress } from "@/components/ui/progress";
import { InfinityIcon, X } from "lucide-react";
import Image from "next/image";

type Props = {
    hearts: number;
    percent: number;
    subscription: boolean;
}

export const Header = ({hearts, percent, subscription}: Props) => {
    return(
        <header className="lg:pt-[50px] pt-[20px] px-10 flex gap-x-7 items-center justify-between max-w-[1140px] mx-auto w-full">
            <X onClick={() => {}} className="text-slate-500 hover:opacity-75 transition cursor-pointer"/>
            <Progress value={percent}/>
            <div className="text-rose-500 flex items-center font-bold">
                <Image src="/heart.svg" height={28} width={28} alt="hearts" className="mr-2"/>
                {subscription ? <InfinityIcon className="h-6 w-6 strokes-[3]"/> : hearts}
            </div>
        </header>
    )
}