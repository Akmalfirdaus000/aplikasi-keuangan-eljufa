import { useEffect } from "react"
import { Head, router } from "@inertiajs/react"

export default function Welcome() {
    useEffect(() => {
        router.visit("/login", { replace: true })
    }, [])

    return (
        <>
            <Head title="Redirecting..." />
        </>
    )
}
