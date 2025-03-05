/*
FEBRIAN NASHRULLAH
2100830
Elliptic Curve Digital Signature Algorithm (ECDSA)
*/


/**Find inverse of a number n modulo p (n^-1 mod p)
* @param {number} n  - number to find it's inverse
* @param {number} p - the modulo
* @returns {number} the inverse of n mod p
*/
const findInverse = (n, p) =>{
    while(n < 0){n += p}
    n = n % p
    for (let x = BigInt(1); x < p; x += BigInt(1)){
        if((n * x) % p === BigInt(1)){
            return x
        }
    }
}

const GenerateRandomNum = (treshold) => {
    const randomNum = BigInt(Math.floor(Math.random() * Number(treshold)) + 1)
    console.log(randomNum)
    return randomNum
}

/**Find gradient for additions according to the elliptic curve over modulo p rules
 * @param {Number[]} point_1 - the first point for addition 
 * @param {Number[]} point_2 - the second point for addition
 * @param {number} p - the modulo (divisor)
 * @param {number} a - the a value of curve y^2 = x^3 + ax + b
 * @returns {number} the gradient of two points following the elliptic curve rules.
 */
const findGradient = (point_1, point_2, p, a) => {

    if (point_1[0] != point_2[0]){
        //Case 1 where two x are different
        //return: (y2 - y1) / (x2 - x1)
        return ((point_2[1] - point_1[1]) * BigInt(findInverse(point_2[0] - point_1[0], p))) % p


    }else if(point_1[0] == point_2[0] && point_1[1] == point_2[1]){
        //case 3 where both the same point
        //return: (3x_1^2 + a) / (2 * y_1)
        return (((BigInt(3) * point_1[0] * point_1[0] ) + a) * findInverse(BigInt(2) * point_1[1], p)) % p   
    }
}

/**
 * Function for adding two points with elliptic curve over Zp addition rules
 * @param {Function} findGradient - function to find the gradient of two points 
 * @param {Number[]} point_1 - first point 
 * @param {Number[]} point_2 - second point
 * @param {Number} p - the modulo (divisor) 
 * @param {Number} a  - the a value of curve y^2 = x^3 + ax + b
 * @returns {number[]} addition result based on elliptic curve rules
 */
const pointAdd = (findGradient, point_1, point_2, p, a) => {
    if (point_1[0] == point_2[0] && BigInt(-1) * (point_1[1] - p) == point_2[1]){
        return Object.freeze([Infinity, Infinity])
    
    }else if (point_1[0] == Infinity && point_1[1] == Infinity){
        return point_2

    }else if(point_2[0] == Infinity && point_2[1] == Infinity){
        return point_1
    
    }else{
        const gradient = findGradient(point_1, point_2, p, a)
        x3 = (gradient ** BigInt(2) - point_1[0] - point_2[0]) % p
        y3 = (gradient * (point_1[0] - x3) - point_1[1]) % p
        while(x3 < BigInt(0)){x3 += p}
        while(y3 < BigInt(0)){y3 += p}
        return Object.freeze([x3, y3])
    }    
}

/**
 * 
 * @param {Function} pointAdd - addition function
 * @param {number[]} point_1 - point to multiply
 * @param {number} p - the modulo (divisor)
 * @param {number} a - the a value of curve y^2 = x^3 + ax + b
 * @param {number} scalar - scalar multiplier 
 * @returns {number[]} point result from multiplication
 */
const pointMulti = (pointAdd, point_1, p, a, scalar) => {
    let point_temp = point_1
    for (let i = BigInt(0); i < scalar-BigInt(1); i+= BigInt(1)){
        point_temp = pointAdd(findGradient, point_temp, point_1, p, a)
        //console.log(point_temp)
    }
    const point = point_temp
    return point
}

/**
 * 
 * @param {number} order - order of the curve 
 * @returns {number} private key
 */
const generatePrivKey = (order) => {
    privKey = BigInt(0)
    while (privKey < BigInt(1)){
        privKey = BigInt(Math.floor((Math.random()) * Number(order))) - BigInt(1)
    }
    return privKey
}

/**
 * 
 * @param {number} privKey - signer's private key  
 * @param {number[]} base_point - the choosen base point G over the curve
 * @param {number} p - the modulo (divisor)
 * @param {number} a - the a value of curve y^2 = x^3 + ax + b
 * @returns {number[]} list of sender's public key [a,b]
 */
const generateKey = (privKey, base_point, p, a) => {
    return pointMulti(pointAdd, base_point, p, a, privKey)
}

/**
 * 
 * @param {Function} pointMulti - point multiplication function 
 * @param {number[]} base_point - base point G over the curve
 * @param {number} p - the modulo (divisor)
 * @param {number} a - the a value of curve y^2 = x^3 + ax + b
 * @param {number} order - order of the point in the curve
 * @param {number} privKey - signer's private key
 * @param {number} message - message to sign
 * @param {number} k - selected k value for signing
 * @returns {number[]} [R,S] indicates ECDSA's signed message
 */
const signing = (pointMulti, base_point, p, a, order, privKey, message) => {
    let r = BigInt(0) 
    let sign_message = BigInt(0)
    let random_num_inverse
    while (r == BigInt(0) || sign_message == BigInt(0)){
        let k = GenerateRandomNum(order)
        //const pubKey = pointMulti(pointAdd, base_point, p, a, privKey)
        const k_times_base = pointMulti(pointAdd, base_point, p, a, k)
        random_num_inverse = findInverse(k, order)
        r = BigInt(k_times_base[0] % order)
        sign_message = (random_num_inverse * (message + privKey * r)) % order
        //console.log(privKey * r)
    }

    return Object.freeze([r, sign_message])

}

/**
 * 
 * @param {Function} pointMulti - point multiplication function
 * @param {Number (a, b)} base_point - base point G over the curve
 * @param {Number} order - order of the point in the curve
 * @param {Number (a, b)} pubKey - signer's public key
 * @param {Number} signed - signed message [R,S]
 * @param {Number} message - message to check (verify)
 * @param {Number} p - the modulo (divisor)
 * @param {Number} a - the a value of curve y^2 = x^3 + ax + b
 * @returns {boolean} returns true if the message valid, and false if message invalid
 */
const validation = (pointMulti, base_point, order, pubKey, signed, message, p, a) => {
    const s_inverse = findInverse(signed[1], order)
    const u_1 = (s_inverse * message) % order
    const u_2 = (s_inverse * signed[0]) % order
    const X = pointAdd(findGradient, pointMulti(pointAdd, base_point, p, a, u_1), pointMulti(pointAdd, pubKey, p, a, u_2), p, a)
    console.log(`signed[0]: ${signed[0]},s_inverse: ${s_inverse}, U1: ${u_1}, u2: ${u_2}, X: ${X}`)
    if (signed[0] == X[0]){
        return true
    }else{
        return false
    }
}
