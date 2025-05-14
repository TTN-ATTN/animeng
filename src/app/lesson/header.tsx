import { Progress } from "@/components/ui/progress";
import { InfinityIcon, X } from "lucide-react";
import Image from "next/image";
import {useExitModal} from "@/store/use-exit-modal"

type Props = {
    hearts: number;
    percent: number;
    subscription: boolean;
}

export const Header = ({hearts, percent, subscription}: Props) => {
    const {open} = useExitModal();
    {/* useExitModal có 1 biến lưu trạng thái với 2 option open và close nếu gọi hàm open 
        thì sẽ tự động bật biến lưu trạng thái, close ngược lại */}
    return(
        <header className="lg:pt-[50px] pt-[20px] px-10 flex gap-x-7 items-center justify-between max-w-[1140px] mx-auto w-full">
            <X onClick={open} className="text-slate-500 hover:opacity-75 transition cursor-pointer"/>
            <Progress value={percent}/>
            <div className="text-rose-500 flex items-center font-bold">
                <Image src="/heart.svg" height={28} width={28} alt="hearts" className="mr-2"/>
                {subscription ? <InfinityIcon className="h-6 w-6 strokes-[3] shrink-0"/> : hearts}
            </div>
        </header>
    )
}