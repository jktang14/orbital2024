'use client'
import ResponsiveAppBar from "./navbar"
import styles from './style.module.css'

const CosmeticPage = () => {
    
    const handleBoardChange = (event) => {
        const color = event.target.value;
        localStorage.setItem('boardColor', color);
    }

    return (
        <>
            <ResponsiveAppBar/>
            <div className={styles.cosmetics}>
                <h2>Customise your experience!</h2>
                <div className={styles.boardColor}>
                    <h4 style={{color: "grey", marginTop: "0", marginBottom:"10px"}}>Change your board color</h4>
                    <input type="color" className={styles.colorPicker} onChange={handleBoardChange}/>
                </div>
            </div>
            
        </>
    )
}

export default CosmeticPage;