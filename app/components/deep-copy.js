const DeepCopy = (array) => {
    return array.map(row => [...row]);
}


export default DeepCopy;