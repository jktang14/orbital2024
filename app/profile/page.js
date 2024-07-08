'use client'
import { useState, useEffect } from "react"
import styles from './style.module.css'
import ResponsiveAppBar from "./navbar"
import { useImage, useUpdateImage } from "../components/image-provider"

const Profile = () => {
    const [username, setUsername] = useState('');
    const imageUrl = useImage();
    const updateImageUrl = useUpdateImage();
    
    useEffect(() => {
        // Check if window and localStorage are available
        if (typeof window !== 'undefined') {
            const storedUsername = localStorage.getItem('username');
            if (storedUsername) {
                setUsername(storedUsername);
            }
        }
    }, []);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            updateImageUrl(reader.result);
            localStorage.setItem('imageUrl', reader.result);
          };
          reader.readAsDataURL(file);
        }
      };

    return (
        <div className={styles.body}>
            <ResponsiveAppBar/>
            <div className={styles.container}>
                <div>
                    <h2>Profile</h2>
                </div>
                <div className={styles.user}>
                    <label>Username</label>
                    <input 
                        style={{padding: "5px"}}
                        type="text" 
                        value = {username}
                        disabled
                    />
                </div>
                <div className={styles.image}>
                    <label>Picture</label>
                    <div className={styles.imageContainer}>
                        <img src="upload.png" style={{height: "2em", width: "2em"}}/>
                        <div className={styles.description}>
                            <input
                            className={styles.imageSelector}
                            type = "file"
                            id = "file"
                            accept="image/*,.png,.jpeg,.jpg"
                            onChange={handleImageUpload}
                            />
                            <label htmlFor="file" className={styles.customButton}>
                            Choose a file
                            </label>
                            <p style={{margin: "0px", fontSize: "0.8em"}}>Accepts PNG, JPG or JPEG</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile;