type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-(--container-page) px-5 sm:px-8 lg:px-10 ${className}`}
    >
      {children}
    </div>
  );
}
