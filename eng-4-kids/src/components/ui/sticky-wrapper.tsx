/* 
    Frontend component: sticky sidebar để cuộn trang
*/

type Props = {
    children: React.ReactNode; // Prop `children` dùng để nhúng các component con vào component cha.
}

export const StickyWrapper = ({ children }: Props) => {
// Component `StickyWrapper` dùng để bọc các component con và tạo ra hiệu ứng cuộn trang mượt mà.
    return (
        <div className="hidden lg:block w-[368px] sticky bottom-6 self-end">
            <div className="min-h-[calc(100vh-48px)] flex flex-col gap-y-4">
                {children}
            </div>
        </div>
    )
}
