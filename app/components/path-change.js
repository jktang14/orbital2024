'use client'
import { realtimeDatabase, auth } from "../firebase";
import { useEffect } from "react";
import { ref, update } from "firebase/database";
import { usePathname } from "next/navigation";

const updateStatus = (userId, status) => {
    let userRef = ref(realtimeDatabase, 'users/' + userId);
    update(userRef, {
        status: status
    });
};

const HandlePathChange = () => {
    const pathname = usePathname();

    useEffect(() => {
        if (auth.currentUser) {
            if (pathname == '/game') {
                updateStatus(auth.currentUser.uid, 'online');
            } else {
                updateStatus(auth.currentUser.uid, 'offline');
            }
        }
    }, [pathname]);
}

export { HandlePathChange, updateStatus};