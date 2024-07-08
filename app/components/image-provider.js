import React, { createContext, useContext, useState } from 'react';

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
    return (
        <imageContext.Provider value = {image}>
            <UpdateImageContext.Provider value = {setImage}>
                {children}
            </UpdateImageContext.Provider>
        </imageContext.Provider>
    )
}

export default ImageProvider;