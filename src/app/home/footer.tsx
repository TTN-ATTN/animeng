import { AustraliaFlag, CanadaFlag, UKFlag, USFlag, VNFlag } from "@/components/ui/flag";
import { Button } from "@/components/ui/button";
export function Footer(){
    return (
        <footer className="lg:block h-20 w-full border-t-2 border-slate-200 p-2">
            <div className="max-w-screen-lg mx-auto flex items-center justify-evenly h-full">
                <Button variant="default" size="lg" className="w-1/6">
                    <UKFlag />
                    UK
                </Button>
                <Button variant="default" size="lg" className="w-1/6">
                    <USFlag />
                    US
                </Button>
                <Button variant="default" size="lg" className="w-1/6">
                    <VNFlag />
                    VN
                </Button>
                <Button variant="default" size="lg" className="w-1/6">
                    <CanadaFlag />
                    CA
                </Button>
                <Button variant="default" size="lg" className="w-1/6">
                    <AustraliaFlag />
                    AU
                </Button>
            </div>
        </footer>
    );
};
