type Props = {
    children: React.ReactNode;
  };
  
  const LessonLayout = ({ children }: Props) => {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
      </div>
    );
  };
  
  export default LessonLayout;
  