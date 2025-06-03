/*
    Route: /about
    Static page providing information about the application.
*/
import Image from "next/image";
// Removed unused Clerk imports
// import {
//     ClerkLoading,
//     ClerkLoaded,
//     SignedIn,
//     SignedOut,
//     SignUpButton,
//     SignInButton
// } from "@clerk/nextjs";
// import { Button } from "@/components/ui/button";
// import { Loader } from "lucide-react";
// import Link from "next/link";

const AboutPage = () => {
    return (
        <div className="max-w-[980px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-2">
            <main className="px-6 md:px-16 py-12 space-y-16 text-black">
                <h1 className="text-3xl font-bold">Giới thiệu</h1>

                {/* Section 1 */}
                <section className="flex flex-col md:flex-row items-center gap-6">
                    <div className="md:w-1/3">
                        <img src="/1.jpeg" alt="Cá nhân hoá giáo dục" className="w-full max-w-xs mx-auto" />
                    </div>
                    <div className="md:w-2/3 space-y-2">
                        <h2 className="text-xl font-bold">Cá nhân hoá giáo dục</h2>
                        <p>
                            Mỗi người đều có phương pháp học riêng. Lần đầu tiên trong lịch sử giáo dục, chúng tôi có thể phân tích
                            từ các thói quen học tập của hàng triệu người để tạo ra một hệ thống giáo dục hiệu quả, thích hợp nhất
                            dành riêng cho từng học viên.
                        </p>
                        <p>
                            Mục tiêu lớn nhất của chúng tôi là làm cho người học trải nghiệm Animeng như đang học với gia sư riêng.
                        </p>
                    </div>
                </section>

                {/* Section 2 */}
                <section className="flex flex-col md:flex-row-reverse items-center gap-6">
                    <div className="md:w-1/3">
                        <img src="/2.jpeg" alt="Làm cho việc học vui hơn" className="w-full max-w-xs mx-auto" />
                    </div>
                    <div className="md:w-2/3 space-y-2">
                        <h2 className="text-xl font-bold">Làm cho việc học vui hơn.</h2>
                        <p>
                            Học ngoại ngữ trực tuyến thường nhàm chán, nên chúng tôi tạo ra một ứng dụng thú vị là Animeng để giúp
                            mọi người có động lực vừa chơi vừa học thêm kỹ năng mới mỗi ngày.
                        </p>
                    </div>
                </section>

                {/* Section 3 */}
                <section className="flex flex-col md:flex-row items-center gap-6">
                    <div className="md:w-1/3">
                        <img src="/3.jpeg" alt="Có thể tiếp cận từ khắp mọi nơi" className="w-full max-w-xs mx-auto" />
                    </div>
                    <div className="md:w-2/3 space-y-2">
                        <h2 className="text-xl font-bold">Có thể tiếp cận từ khắp mọi nơi.</h2>
                        <p>
                            Có hơn 1.2 tỷ người đang học ngoại ngữ và phần lớn đang học vì muốn tiếp cận với nhiều cơ hội học tập
                            hoặc làm việc tốt hơn. Đáng tiếc là quá trình dạy và học ngoại ngữ thường khá đắt đỏ, làm cho nhiều người
                            không thể tiếp cận được.
                        </p>
                        <p>
                            Chúng tôi tạo ra Animeng để tất cả mọi người đều có thể được học ngoại ngữ miễn phí – hoàn toàn không
                            có chi phí ẩn hoặc nội dung phải trả tiền.
                        </p>
                        <p>
                            Animeng được sử dụng phổ biến, từ người giàu nhất thế giới, các diễn viên Hollywood đến những em học
                            sinh tại trường công ở các nước đang phát triển. Chúng tôi tin vào quyền bình đẳng, mọi người đều xứng
                            đáng có được một nền giáo dục chất lượng cao dù họ giàu hay nghèo.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}

// Export để sử dụng, nếu không export thì không thể import ở các file khác
export default AboutPage;
