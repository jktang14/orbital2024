'use client'
import ResponsiveAppBar from "./navbar"
import styles from './style.module.css'

const CosmeticPage = () => {
    
    const pieceMap = {
        'black.png': {'Black': 'black.png', 'White': 'white.png'}, 
        'blackcurve.png': {'Black': 'blackcurve.png', 'White': 'whitecurve.png'},
        'coin1.png': {'Black': 'coin1.png', 'White': 'coin2.png'},
        'diamond1.png': {'Black': 'diamond1.png', 'White': 'diamond2.png'},
        'crown1.png': {'Black': 'crown1.png', 'White': 'crown2.png'}
    }
    
    const handleBoardChange = (event) => {
        const color = event.target.value;
        localStorage.setItem('boardColor', color);
    }

    const handleDefaultBoard = () => {
        localStorage.setItem('boardColor', 'rgb(97, 136, 97)');
    }

    const handleImageClick = (path) => {
        // const url = new URL(path);
        // const link = url.pathname.split('/').pop();
        localStorage.setItem('blackPiece', pieceMap[path]['Black']);
        localStorage.setItem('whitePiece', pieceMap[path]['White']);
    }

    return (
        <>
            <ResponsiveAppBar/>
            <div className={styles.cosmetics}>
                <div className={styles.boardColor}>
                    <h1 className={styles.heading} style = {{color: "white", marginTop: "0", marginBottom:"10px"}}>Change your board color</h1>
                    <input type="color" className={styles.colorPicker} onChange={handleBoardChange}/>
                    <button className={styles.defaultButton} onClick={handleDefaultBoard}>Restore default colour</button>
                </div>
                <div className={styles.pieceSelection}>
                    <h1 className={styles.heading} style={{color: "white", marginTop: "30px", marginBottom:"20px"}}
                    >Change your pieces</h1>
                    <div className={styles.container}>
                        <div className={styles.item}>
                            <img className={styles.image} src='black.png'/>
                            <h3 className={styles.title}>Default</h3>
                            <p className={styles.description}>The default reversi pieces!</p>
                            <button className={styles.selectButton} onClick={() => handleImageClick('black.png')}>Select</button>
                        </div>
                        <div className={styles.item}>
                            <img className={styles.image} src='blackcurve.png'/>
                            <h3 className={styles.title}>Crescent</h3>
                            <p className={styles.description}>A piece that shines like the moon, guiding your path to victory!</p>
                            <button className={styles.selectButton} onClick={() => handleImageClick('blackcurve.png')}>Select</button>
                        </div>
                        <div className={styles.item}>
                            <img className={styles.image} src='coin1.png'/>
                            <h3 className={styles.title}>Coin</h3>
                            <p className={styles.description}>A piece of fortune, flip your way to triumph!</p>
                            <button className={styles.selectButton} onClick={() => handleImageClick('coin1.png')}>Select</button>
                        </div>
                        <div className={styles.item}>
                            <img className={styles.image} src='diamond1.png'/>
                            <h3 className={styles.title}>Diamond</h3>
                            <p className={styles.description}>A sharp piece, cut through your competition like a diamond!</p>
                            <button className={styles.selectButton} onClick={() => handleImageClick('diamond1.png')}>Select</button>
                        </div>
                        <div className={styles.item}>
                            <img className={styles.image} src='crown1.png'/>
                            <h3 className={styles.title}>Crown</h3>
                            <p className={styles.description}>A piece fit for a king!</p>
                            <button className={styles.selectButton} onClick={() => handleImageClick('crown1.png')}>Select</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CosmeticPage;