'use client'
import ResponsiveAppBar from "./navbar"
import styles from './style.module.css'

const CosmeticPage = () => {
    
    const pieceMap = {'blackcurve.png': {'Black': 'blackcurve.png', 'White': 'whitecurve.png'}}
    
    const handleBoardChange = (event) => {
        const color = event.target.value;
        localStorage.setItem('boardColor', color);
    }

    const handleImageClick = (event) => {
        const url = new URL(event.target.src);
        const link = url.pathname.split('/').pop();
        localStorage.setItem('blackPiece', pieceMap[link]['Black']);
        localStorage.setItem('whitePiece', pieceMap[link]['White']);
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
                <div className={styles.pieceSelection}>
                    <h4 style={{color: "grey", marginTop: "30px", marginBottom:"20px"}}>Change your pieces</h4>
                    <div className={styles.container}>
                        <div>
                            <img className={styles.item1} onClick={handleImageClick} src='blackcurve.png'/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CosmeticPage;