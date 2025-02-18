/*
FEBRIAN NASHRULLAH
febrian031318@gmail.com
=====================================================
*/



// const { findHash } = require('./HashSHA3.js')
// const {signing, verifying, generateKey, pointAdd, pointMulti, GenerateRandomNum} = require('./ECDSA.js')

//for communicate with smart contract and blockchain

const contractAddress = '0x054FEf4EBAe7d05E4Be5c0FCF55571b779Af626E'
let contract


// Load Web3
const loadWeb3 = async () => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/web3/dist/web3.min.js';
        script.onload = () => {
            console.log('Web3.js loaded');
            resolve();
        }
        script.onerror = (error) => {
            console.error('Failed to load Web3.js', error);
            reject(error);
        }
        document.head.appendChild(script);
    })
}

const initContract = async () => {
    await loadWeb3()
    try {
        const response = await fetch('./contractABI.json')
        const contractABI = await response.json()

        const web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(contractABI, contractAddress)
        console.log("Contract initialized successfully!: ", contract)

    }catch (error){
        console.error("Error loading contract ABI 0C1-ABILOAD: ", error)
    }
}

async function initializeContract () {
    try {
        // Initialize the contract
        if (!contract) {
            await initContract(); // Ensure the contract is loaded
            console.log('Contract Initialized!')
        }
    }catch (error) {
        console.log("Error initializing contract: ", contract)
    }
}

async function ownerIdentificator(contract, account){
    try {
        const owner = await contract.methods.isOwner().call({from: account})

        if (owner == true){
            console.log('Owner logged id in, address: ', account)
            return {isOwner : true, message : `Address: ${account} connected, Owner logged in`}

        }else{
            console.log('Non-owner logged id in, address: ', account)
            return {isOwner : false, message : `Address: ${account} connected`}
        }

    } catch (error) {
        console.error('Error Owner Detection:', error.message);
    }

}

initializeContract()

// =========== Execution ============================
const pageId = document.body.id
// ============ LOGIN ================================

if (pageId == "login-page"){
    const loginBtn = document.getElementById("login-btn")
    const accountInfo = document.getElementById("account-info")
    const loginInfo = document.getElementById("login-info")

    async function connectMetamask() {

        try {
            // Check if Metamask is installed
            if (typeof window.ethereum === "undefined") {
                loginInfo.innerHTML = `<span class="error">Metamask is not installed. Please install Metamask to continue.</span>`;
                return
            }

            // Ensure the user is on the local blockchain network (7545)
            const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
            if (currentChainId !== "0x539") { // 0x539 is 1337 in hex (Ganache's default chain ID)
                loginInfo.innerHTML = `<span class="error">Please switch to your local blockchain (Ganache) in Metamask.</span>`;
                return
            }

            // Request account access
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

            // Display the connected account
            const account = accounts[0]

            //Identify Owner
            const ownerIdentify = await ownerIdentificator ( contract, account )
            accountInfo.textContent = ownerIdentify.message

            setTimeout(() => {
                window.location.href = "home.html"; // Redirect destination
              }, 1600);

        } catch (error) {
            // Handle errors
            accountInfo.innerHTML = `<span class="error">Error: ${error.message}</span>`
        }


        }

    // Attach the function to the login button
    loginBtn.addEventListener("click", connectMetamask)
}

// ================ HOME ===========================
if (pageId == "home-page"){

    console.log("home page")
    async function homeOwnerConfigure () {
        if (!contract) {
            console.log("Contract not initialized. Initializing now...")
            await initializeContract();
        }

        try{

            const signingNavbar = document.getElementById("li-sign-navbar")
            // Request account access
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        
            // Display the connected account
            const account = accounts[0]
        
            // Detect ownership
            const ownership = await ownerIdentificator(contract, account)
        
            if (ownership.isOwner){
                signingNavbar.style.display = 'flex'
                console.log("owner logged in, everything will be shown")
            } else {
                console.log("non owner, signing will not shown on navbar")
            }

        } catch (error) {
            console.error("Error in homeOwnerConfigure:", error.message)
        }
    }
    homeOwnerConfigure()
}

// ============= Generate Key ======================
if (pageId == "generate-key-page"){
    // Get elements
    const generateKeyBtn = document.getElementById("generateKey-btn")
    const privKeyDisplay = document.getElementById("private-key-generate")
    const pubKeyDisplay = document.getElementById("public-key-generate")
    const backButton = document.getElementById("back-btn")

    generateKeyBtn.addEventListener("click", async () => {
        privKeyGenerated = await privKeyGenerator()
        pubKeyGenerated = await pubKeyGenerator(privKeyGenerated)
        
        privKeyDisplay.textContent = `Private Key: ${privKeyGenerated}`
        pubKeyDisplay.textContent = `Public Key: ${pubKeyGenerated}`
    })

    backButton.addEventListener("click", () => {
        window.location.href = "signing.html"
    })
}

// ================ SIGNING ========================

if (pageId == "signing-page"){
    // Get elements
    const fileInput = document.getElementById("file-input-sign")
    const customFileBtn = document.getElementById("inputFileSign-btn")
    const fileNameDisplay = document.getElementById("file-name")
    const publicKeyDisplay = document.getElementById("public-key")
    const signResultDisplay = document.getElementById("sign-result")
    const signingNavbar = document.getElementById("li-sign-navbar")
    const generateKeyBtn = document.getElementById("generateKey-btn")

    signingNavbar.style.display = 'flex'

    // Generate Key Button Action
    generateKeyBtn.addEventListener("click", () => {
        window.location.href = "generateKey.html"
    })

    // Get the owner
    async function getOwner () {

        // Request account access
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

        // Display the connected account
        const account = accounts[0]

        // Detect ownership
        const ownership = await ownerIdentificator(contract, account)

        if (ownership.isOwner){
            signingNavbar.style.display = 'flex'
        }

        return {ownership: ownership.isOwner, account : account}
    }

    // Trigger file dialog on button click
    customFileBtn.addEventListener("click", async () => {
        // run getOwner
        const user = await getOwner()

        // Conditional if user is not owner, then hide signing page and redirect to home
        if (!user.ownership){
            window.location.href = "login.html"                             
        }

        fileInput.click();
    });

    // Update file name display when a file is selected
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name; // Display selected file name
        } else {
            fileNameDisplay.textContent = "No file chosen"
        }
    });

    // Process Sign
    document.getElementById("processSign-btn").addEventListener("click", async() =>{
        // run getOwner
        const user = await getOwner()

        // Conditional if user is not owner, then hide signing page and redirect to home
        if (!user.ownership){
            window.location.href = "login.html"                             
        }

        // Showing error if no file selected
        if(!fileInput.files.length){
            console.error("No file selected!")

            // Show the warning modal
            const warningModal = document.getElementById('warningModal')
            if (warningModal) {
                warningModal.style.display = 'flex'
                document.getElementById("closeModal").addEventListener("click", () => {
                    warningModal.style.display = 'none';
                })
            } else {
                console.error("Warning modal not found in DOM!")
            }

            return
        }

        // Extract the file content
        const fileContent = await fileToArrayBuffer(fileInput.files[0])
        let privKey =[document.getElementById("PrivKey")]

        //console.log(`File Content: ${fileContent}`)

        if(validateIntegerInputs(privKey) == false){
            console.error("Only input integer into sign and public key!")
            return
        }
        
        privKey = privKey.map(input => BigInt(input.value))
        console.log(typeof privKey[0])

        const pubKey = await pubKeyGenerator(privKey[0])
        const {hash, sign} = await hashSigning(fileContent, privKey[0], pubKey)

        console.log("account: ", user.account)
        console.log(`e-certificate hash ${hash}\nSign ${sign}\nhashdtype: ${typeof hash}`)

        try {
            const receipt = await contract.methods
                .addCertificate('0x' + hash, sign[0], sign[1])
                .send({ from: user.account, gas: 300000 })  // account should be only owner, future change needed
            const getEvents = receipt.events

            if (getEvents.UnauthorizedAccess){
                console.log("Only OWNER can sign e-certificate!")
                publicKeyDisplay.textContent = (`Only OWNER can sign e-certificate!`)
                signResultDisplay.textContent = (``)
            }else if (getEvents.HashExist) {
                console.log("E-Certificate Already Exist! Will not store it on Blockchain. ")
                publicKeyDisplay.textContent = (`E-Certificate Already Exist! Will not store it on Blockchain Please check on the 'Validation' page`)
                signResultDisplay.textContent = (``)
            } else {
                console.log('Certificate added to blockchain:', receipt)
                publicKeyDisplay.textContent = (`Public key: ${pubKey}`)
                signResultDisplay.textContent = (`sign: ${sign}`)
        
            }

        } catch (error) {
            console.error('Error adding certificate:', error.message);

        }

    })
}

// ================= VALIDATION ===================

if (pageId == "validation-page"){
    // Get elements
    const fileInput = document.getElementById("file-input-sign");
    const customFileBtn = document.getElementById("inputFileSign-btn");
    const fileNameDisplay = document.getElementById("file-name");
    const valResultDisplay = document.getElementById("validation-result");

    async function valOwnerConfigure () {
        if (!contract) {
            console.log("Contract not initialized. Initializing now...")
            await initializeContract();
        }

        try{

            const signingNavbar = document.getElementById("li-sign-navbar")
            // Request account access
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        
            // Display the connected account
            const account = accounts[0]
        
            // Detect ownership
            const ownership = await ownerIdentificator(contract, account)
        
            if (ownership.isOwner){
                signingNavbar.style.display = 'flex'
                console.log("owner logged in, everything will be shown")
            } else {
                console.log("non owner, signing will not shown on navbar")
            }

        } catch (error) {
            console.error("Error in homeOwnerConfigure:", error.message)
        }
    }
    valOwnerConfigure()

    // Trigger file dialog on button click
    customFileBtn.addEventListener("click", () => {
        fileInput.click()
    })

    // Update file name display when a file is selected
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name; // Display selected file name
        } else {
            fileNameDisplay.textContent = "No file chosen";
        }
        valResultDisplay.textContent = "Validation result will appear here."
    })

    document.getElementById("processValidation-btn").addEventListener("click", async() => {
        let pubKeyInput = [document.getElementById('firstPubKey'), document.getElementById('secondPubKey')]
        if(!fileInput.files.length){
            console.error("No file selected!")
            // Show the warning modal
            const warningModal = document.getElementById('warningModal')
            if (warningModal) {
                warningModal.classList.add('show')
                document.getElementById("closeModal").addEventListener("click", () => {
                    warningModal.classList.remove('show');
                })
            } else {
                console.error("Warning modal not found in DOM!")
            }
            return
        }

        // Make sure only integers being inputted as public key
        if(validateIntegerInputs(pubKeyInput) == false){
            console.error("Only input integer into sign and public key!")
            return
        }

        const fileContent = await fileToArrayBuffer(fileInput.files[0])
        const hash = findHash(fileContent)

        // Retirieve e-certificate
        try{
            //Call retrieve e-certificate on smart contract
            const sign = await contract.methods
                                        .retrieveCertificate('0x' + hash)
                                        .call()
            const { 0: firstSign, 1: secondSign, 2: timeStamp } = sign
            const timeStampConvrtd = new Date(Number(timeStamp) * 1000).toLocaleString()
            console.log(`firstsign ${firstSign}, secondSign: ${secondSign}, timeStamp ${timeStampConvrtd}, type: ${typeof sign}`)

            //signInput = signInput.map(input => BigInt(input.value, 10))
            pubKeyInput = pubKeyInput.map(input => BigInt(input.value, 10))
            signInput = [firstSign, secondSign]

            const verifyingResult = await messageVeryfying(hash, signInput, pubKeyInput)

            console.log(`Verifying Result: ${verifyingResult}`)
            if (verifyingResult == true) {

                console.log(`e-certificate hash ${hash}\nVerifying result: ${verifyingResult}`)

                valResultDisplay.textContent = `Certificate Valid!
                First Sign: ${firstSign}
                Second Sign: ${secondSign}
                Time Added: ${timeStampConvrtd}`

            } else {
                valResultDisplay.textContent = "Validation failed: The sign does not match public key and/or file provided!"

            }

        } catch (error) {
            console.error('Error retrieving certificate:', error.message);
            valResultDisplay.textContent = 'Validation failed: e-certificate not found!';
        }

    })}

// ================= UTILITY FUNCTION ========================

// Validation input is integer
function validateIntegerInputs(inputs) {
    return inputs.every(input => {
        const value = parseInt(input.value, 10); // Convert the input value to an integer
        return Number.isInteger(value); // Check if the value is an integer
    });
}

async function fileToArrayBuffer(file) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    return new Promise((resolve, reject) => {
        reader.onload = async () => {
            const pdfData = new Uint8Array(reader.result);
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

            let textContent = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                textContent += text.items.map(item => item.str).join(" ");
            }

            resolve(textContent.trim());
        };
        reader.onerror = reject;
    });
}

// Setup the curve

/**
 * 
 * @returns {list}
 */
async function loadCurve() {
    const response = await fetch('curve.json')
    const curveData = await response.json()

    // Convert values to BigInt
    const mod = BigInt(curveData.mod)
    const curve = curveData.curve.map(BigInt)
    const base_point = curveData.base_point.map(BigInt)
    const order = BigInt(curveData.order)

    return {mod, curve, base_point, order}
}

/**
 * 
 * @param {.pdf} file 
 * @param {integer} privKey 
 * @param {integer[]} pubKey 
 * @returns 
 */

// Signing
async function hashSigning(file, privKey, pubKey){
    // Hashing:
    const hash = findHash(file)
    const hashtoBigInt = hashtoInt(hash) 
    // Curve Parameters
    const {mod, curve, base_point, order} = await loadCurve()
    console.log(`Curve Parameters: mod ${mod} modtype ${typeof mod}, curve: ${curve} curvetype ${typeof curve[0]}, base_point: ${base_point} basetype ${typeof base_point[0]}, order: ${order} ordertype ${typeof order}`)
    
    // Signing
    const sign = signing(pointMulti, base_point, mod, curve[0], order, privKey, hashtoBigInt)
    console.log(`hash ${hash} \nHash big int: ${hashtoBigInt} \nSign ${sign} \npubKey ${pubKey}`)
    return { hash, sign }
}

async function messageVeryfying(hash, sign, pubKey){
    const hashtoBigInt = hashtoInt(hash)

    // Curve Parameters
    const {mod, curve, base_point, order} = await loadCurve()
    console.log(`Curve Parameters: mod ${mod} modtype ${typeof mod}, curve: ${curve} curvetype ${typeof curve[0]}, base_point: ${base_point} basetype ${typeof base_point[0]}, order: ${order} ordertype ${typeof order}`)

    // Verifying Signature
    const verified = verifying(pointMulti, base_point, order, pubKey, sign, hashtoBigInt, mod, curve[0])

    if (verified == true){
        result = 'message validated!'
    }else{
        result = 'message not valid'
    }
    console.log(result)
    return verified
}

async function privKeyGenerator () {
    // Curve Parameters
    const {mod, curve, base_point, order} = await loadCurve()
    console.log(`Curve Parameters: mod ${mod} modtype ${typeof mod}, curve: ${curve} curvetype ${typeof curve[0]}, base_point: ${base_point} basetype ${typeof base_point[0]}, order: ${order} ordertype ${typeof order}`)

    const privateKey = generatePrivKey(order)

    return privateKey
}

async function pubKeyGenerator (privKey) {

    // Curve Parameters
    const {mod, curve, base_point, order} = await loadCurve()
    console.log(`Curve Parameters: mod ${mod} modtype ${typeof mod}, curve: ${curve} curvetype ${typeof curve[0]}, base_point: ${base_point} basetype ${typeof base_point[0]}, order: ${order} ordertype ${typeof order}`)

    console.log(`PrivKey Type: ${typeof privKey}`)
    const pubKey = generateKey(privKey, base_point, mod, curve[0]) 
    console.log(`Pubkey from generator ${pubKey}`)
    return pubKey

}