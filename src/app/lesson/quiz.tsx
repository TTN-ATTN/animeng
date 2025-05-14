"use client";

import { challenges, challOptions, userSubscription} from "../../../db/schema";
import { useState, useTransition,  useEffect} from "react";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Challenge } from "@/app/lesson/challenge"
import { Footer } from "./footer";
import {toast} from "sonner";
import { upsertChallengeProgess } from "../../../actions/challenge-progess";
import { reduceHearts } from "../../../actions/user-progress";
// import { redirect } from "next/navigation";
import { useAudio, useWindowSize, useMount} from "react-use";
import { Resultcard } from "./result-card";
import  Image  from "next/image";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti"
import {useHeartsModal} from "@/store/use-hearts-modal";
import {usePracticeModal} from "@/store/use-practice-modal";
type Props = {
    lessonId: number;
    lessonChallenges: (typeof challenges.$inferSelect & {
        completed: boolean;
        challOptions: typeof challOptions.$inferSelect[];
    })[];
    hearts: number;
    percent: number;
    subscription: typeof userSubscription.$inferSelect &{
        isActive: boolean;
    } | null;
}

export const Quiz = ({lessonId, lessonChallenges, hearts, percent, subscription}: Props) => {
    const { open : openHeartsModal } = useHeartsModal();
    const { open : openPracticeModal } = usePracticeModal();

    useMount(() => {
        if (percent === 100)
        {
            openPracticeModal();
        }
    })

    const {width,height} = useWindowSize();
    const router = useRouter();
    const [finishAudio, , finishControls] = useAudio({ src: "/finish.mp3"});

    //correctand incorrect audio
    const [correctAudio,_c,correctControls] = useAudio({ src: "/correct.wav"})
    const [incorrectAudio,_inc,incorrectControls] = useAudio({ src: "/incorrect.wav"})

    const [pending, startTransition] = useTransition();

    const [_lessonId] = useState(lessonId)
    const [p, setPercent] = useState(() =>{
        return percent === 100 ? 0 : percent;
    // this is to prevent the percent from being 100 when we first load the page
    // because we have already completed the lesson
    });
    const [h, setHearts] = useState(hearts);
    const [challenges] = useState(lessonChallenges)
    const [activeIndex, setActiveIndex] = useState(() => {
        const uncompletedIndex = challenges.findIndex((challenge) => !challenge.completed);
        return uncompletedIndex === -1 ? 0 : uncompletedIndex;
    });
    const [selectedOp, setSelectedOp] = useState<number>();
    // above is simplying find uncomletedIndex, get percent and hearts
    
    const [status,setStatus] = useState<"correct" | "wrong" | "none">("none"); // default value is none
    const challenge = challenges[activeIndex];

    // after last question, we should redirect
    // if (activeIndex == challenges.length) redirect("/learning");
    
    const options = challenge?.challOptions ?? [];

    // Look at onContinue bellow
    const onNextQuizz = () => {
        setActiveIndex((current) => current + 1);
    };

    const onSelect = (id: number) => 
    {
        // If we have clicked before, status must be wrong or correct so if
        // we click the second time nothing would be changed
        if (status !== "none") return;
        setSelectedOp(id);
    };


    const onContinue = () =>
    {
        if (!selectedOp) return;

        // whether answer is correct or not we have to reset
        // them for the next turn
        if (status == "wrong")
        {
            setStatus("none");
            setSelectedOp(undefined);
            return;
        }

        if (status == "correct")
        {
            onNextQuizz();
            setStatus("none");
            setSelectedOp(undefined);
           
            return;
            
        }

        const correctOp = options.find((option) => option.correct);
        
        // If we can't find that option, we might forget to add it into our db :))
        if (!correctOp)
        {
            return;
        }

        if (correctOp.id === selectedOp)
        {
            startTransition(() => {
                // console.log("here");
                upsertChallengeProgess(challenge.id).then((response) => {
                  
                    if (response?.error == "hearts")
                    {
                        openHeartsModal();
                        return;
                    }
                    correctControls.play();
                    setStatus("correct");
                    // console.log(challenges);
                    // console.log(percent);
                    setPercent((prev) => prev + 100 / challenges.length);
                    // console.log(percent);
                    // this is just a practice (play again)
                    if (percent === 100)
                    {
                        setHearts((prev) => Math.min(prev + 1, 5));
                    }
                })
                .catch(() => toast.error("Sorry, something went wrong please try again! Please try again"))
            })
        }
            else
        {
            startTransition(() => {
                reduceHearts(challenge.id)
                .then((response) =>{
                    if (response?.error === "hearts")
                    {
                        openHeartsModal();
                        return;
                    }
                    incorrectControls.play();
                   
                    setStatus("wrong");

                    if (!response?.error)
                    {
                        setHearts((prev) => Math.max(prev - 1, 0));
                    }
                })
                .catch(() => toast.error("something went wrong, please try again!"))
            })
           
        }
    }
    //* Hieu added this to resolve console error, don't delete it *
    useEffect(() => {
        if (!challenge) {
          finishControls.play();
        }
      }, [challenge, finishControls]);
    
    
    // no more challenge in this lesson:
    if (!challenge)
    {        
        return(
            <>
              {finishAudio}
            <Confetti width = {width} height = {height} recycle = {false} numberOfPieces = {500} tweenDuration = {10000}/>
            <div className = "flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full">
                <Image 
                src = "/finish.svg" 
                alt = "Finish" 
                className = "hidden lg:block" 
                height = {100} 
                width = {100}/>
                <Image 
                src = "/finish.svg" 
                alt = "Finish" 
                className = "block lg:hidden" 
                height = {50} 
                width = {50}/>
            </div>
            <h1 className = "text-xl lg:text-3xl font-bold text-neutral-700">
                Great job! <br/>
                You've done a whole lesson, Congrats!
            </h1>
            <div className = "flex items-center gap-x-4 w-full">
                <Resultcard variant = "points" value = {challenges.length * 10} />
                <Resultcard variant = "hearts" value = {hearts} />
            </div>
            {/* Footer for practice again if we use useRouter to push route learning so that we can redirect to it */}
            <Footer lessonId = {_lessonId} status = "done" onCheck = {() => {router.push("/learning")}}/>
            </>
        );
    }


    // challenge? -> check if challenge is not null or undefined 
    // if it is defined we will access its challOptions
    // ?? [] -> if challenge.challOptions is undefined or null we will get an empty array
    const title = challenge.type === "VOICE" ? "Select the correct meaning" : challenge.question;
    return(
        <>
        {incorrectAudio}
        {correctAudio}
        {/* Hieu added to this to resolve the console error, actually it is not necessary there but we should keep it */}
        {finishAudio} 
            <Header
                hearts={h}
                percent={p}
                subscription={!!subscription?.isActive}    
            />
            <div className = "max-w-[980px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-2">
                <div className = "h-full flex items-center justify-center">
                    <div className = "lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
                        <h1 className = "text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700">
                        {title}
                        </h1>
                        <div>
                        {challenge.type === "VOICE" && (
                            <QuestionBubble question = {challenge.question} />
                        )}
                        <Challenge
                            options = {options} 
                            onSelect = {onSelect}
                            status = {status}
                            selectedOption = {selectedOp}
                            disabled = {pending}
                            type = {challenge.type}
                        />

                        </div>
                    </div>
                    {/* chalenge components cook here :)) */}
                    
                </div>
            </div>

            <Footer
            disabled = {pending || !selectedOp}
            status = {status}
            onCheck = {onContinue}
            />
        </>
    )
}