import React, { createContext, useContext, useState, useEffect } from 'react';

const imageContext = React.createContext();
const UpdateImageContext = React.createContext();

export const useImage = () => {
    return useContext(imageContext);
}

export const useUpdateImage = () => {
    return useContext(UpdateImageContext);
}

export const ImageProvider = ({value, children}) => {
    const [image, setImage] = useState(value);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedImage = localStorage.getItem('imageUrl');
            if (storedImage) {
                setImage(storedImage);
            }
        }
    })

    return (
        <imageContext.Provider value = {image}>
            <UpdateImageContext.Provider value = {setImage}>
                {children}
            </UpdateImageContext.Provider>
        </imageContext.Provider>
    )
}

export default ImageProvider;