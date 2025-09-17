const MainLayout = ({ children }) => {
  return (
    <div className='flex-1 flex flex-col'>
      <main className='max-w-5xl mx-auto space-y-4 px-4 md:px-0 md:space-y-12 py-24 md:py-32'>{children}</main>
    </div>
  )
}

export default MainLayout
