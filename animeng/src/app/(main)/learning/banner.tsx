import { Button } from "@/components/ui/button";
import { Notebook } from "lucide-react";
import Link from "next/link";

type Props = {
    title: string;
    description: string;
}

export const Banner = ({title, description}: Props) => {
    return (
        <div className="w-full rounded-xl bg-yellow-200 p-5 text-white flex items-center justify-between">
            <div className="space-y-2.5">
                <h3 className="text-2xl font-bold">
                    {title}
                </h3>
                <p className="text-lg">
                    {description}
                </p>
            </div>

            <Link href="/lesson">
                <Button size="lg" variant="yellowBtn" className="hidden lg:flex items-center gap-2">
                    <Notebook className="mr-2" /> Bắt đầu học
                </Button>
            </Link>
        </div>
    )
}