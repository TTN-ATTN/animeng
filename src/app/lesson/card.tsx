import { challenges } from "../../../db/schema";
import {cn} from "@/lib/utils"
import Image from "next/image"
import {useAudio, useKey} from "react-use"
import { useCallback } from "react";
type Props = {
    id: number;
    imageSrc: string| null;
    audioSrc: string | null;
    text: string;
    shortcut: string;
    selected?: boolean;
    onClick: () => void;
    disabled?: boolean;
    status?: "correct" | "wrong" | "none";
    type: typeof challenges.$inferSelect["type"];
};

export const Card = ({
    id,
    imageSrc,
    audioSrc,
    text,
    shortcut,
    selected,
    onClick,
    disabled, // true will avoid interaction
    status,
    type,
}: Props) => {
    const [audio, _, controls] = useAudio ({src : audioSrc || ""})
    const handleClick = useCallback(() =>{
        if (disabled) return;

        controls.play();
        //play the voice

        onClick()
    }, [disabled,onClick,controls]);

    useKey(shortcut, handleClick, {}, [handleClick]);
    //Keyboard shortcut (1,2,3 as our answers are signed like that)

    return (
   <div
    onClick={handleClick}
    className={cn(
        "h-full border-2 rounded-xl border-b-4 p-4 lg:p-6 cursor-pointer transition-all duration-300 ease-in-out",
        "hover:shadow-lg hover:bg-black/5 active:border-b-2 active:scale-95", 
        selected && "border-sky-400 bg-sky-100 hover:bg-sky-200 shadow-md", 
        selected && status === "correct" && "border-green-400 bg-green-100 hover:bg-green-200 shadow-lg", 
        // Green for correct
        selected && status === "wrong" && "border-red-400 bg-red-100 hover:bg-red-200 shadow-lg", 
        // Red for wrong
        disabled && "pointer-events-none hover:bg-white" ,
        // Disabled state styling
        type === "VOICE" && "lg:p-3 w-full"
    )}>
        {audio}
    {imageSrc && (
        <div  className = "relative aspect-square mb-4 max-h-[80px] lg:max-h-[150px] w-full">
            <Image src = {imageSrc} fill alt = {text} />
        </div>
    )}
    <div className = {cn(
        "flex items-center justify-between", type === "VOICE" && "flex-row-reverse",
    )}>
        {type === "VOICE" && <div/>}
        <p className ={cn(
            "text-neutral-600 text-sm lg:text-base", 
            selected && "text-sky-500",
            selected && status == "correct" && "text-green-500",
            selected && status == "wrong" && "text-rose-500",
        )}>
            {text}
        </p>
        <div className = {cn(
            "lg:w-[30px] lg:h-[30px] w-[20px] h-[20px] border-2 flex items-center justify-center rounded-lg text-neutral-400 lg:text-[15px] test-xs font-semibold",
            selected && "border-sky-300 text-sky-500",
            selected && status == "correct" && "border-green-500 text-green-500",
            selected && status == "wrong" && "border-rose-500 text-rose-500",
        )}>
        {shortcut}
        </div>

    </div>
</div>
    );
};