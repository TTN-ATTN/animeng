import {challOptions, challenges } from "../../../db/schema";
import {cn} from "@/lib/utils";
import {Card} from "./card";
type Props = {
    options: typeof challOptions.$inferSelect[];
    // options will be an array of interred types 
    // of derived frmo the structure of challOptions
    
    onSelect: (id:number) => void;
    status: "correct" | "wrong" | "none";
    selectedOption?:number;
    disabled?:boolean;
    type: typeof challenges.$inferSelect["type"];
    // Take all kind of "type" value available from challenges array
};

export const Challenge = ({selectedOption,options,onSelect,status,disabled,type}:Props) =>
{
    return (
        <div className = {cn(
            "grid gap-2", type === "VOICE" && "grid-cols-1", 
            type === "CHOICE" && "grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]"
        )}>
           {options.map((option,i) => (
                <Card
                    key = {option.id}
                    id = {option.id}
                    text = {option.text}
                    imageSrc = {option.imageSrc}
                    shortcut = {`${i + 1}`}
                    selected = {selectedOption === option.id}
                    onClick = {() => onSelect(option.id)}
                    status = {status}
                    audioSrc = {option.audioSrc}
                    disabled = {disabled}
                    type = {type} />
                // {/* in jsx or tsx everything wrapped inside {} will 
                // be evaluated as Javascript code and will be rendered as part of html 
                // JSON.stringigy convert option to json string*/}

           ))}
        </div>
    );
};