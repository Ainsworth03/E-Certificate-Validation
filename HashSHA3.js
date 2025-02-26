/*
FEBRIAN NASHRULLAH
2100830
SHA3-256
=====================================================
*/


//curve: x^3 + ax + b mod r
/**
 * 
 * @param {string} message 
 * @returns {string} - hash Keccak-256 result
 */
const findHash = (message) => {
    const hash_result = keccak_256(message)
    return hash_result
}

/**
 * 
 * @param {byte256} hash - hash value (preffered Keccak-256)
 * @returns {BigInt} converted hash value into BigInt
 */
const hashtoInt = (hash) => {
    const hash_int = BigInt("0x" + hash)
    return hash_int 
}
