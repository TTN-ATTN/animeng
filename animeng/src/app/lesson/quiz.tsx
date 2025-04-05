"use client";

import { challenges, challOptions } from "../../../db/schema";
import { useState } from "react";
import { Header } from "./header";

type Props = {
    lessonId: number;
    lessonChallenges: (typeof challenges.$inferSelect & {
        completed: boolean;
        challOptions: typeof challOptions.$inferSelect[];
    })[];
    hearts: number;
    percent: number;
    subscription: any; // implement subscription type later   
}

export const Quiz = ({lessonId, lessonChallenges, hearts, percent, subscription}: Props) => {
    const [p, setPercent] = useState(percent);
    const [h, setHearts] = useState(hearts);
    return(
        <>
            <Header
                hearts={h}
                percent={p}
                subscription={!!subscription?.isActive}    
            >

            </Header>
        </>
    )
}