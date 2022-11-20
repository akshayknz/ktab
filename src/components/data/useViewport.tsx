import { useEffect, useState } from "react"

const useViewport = () => {
    const [width, setWidth] = useState(window.innerWidth)

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth)
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return { 
        w: width, 
        tab: width<1023, //return true if in tablet breakpoint
        mob: width<767 //return true if in mobile breakpoint
    }
    
}

export default useViewport