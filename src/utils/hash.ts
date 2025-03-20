import { hash, compare} from "bcrypt"

export async function hashPassword(password: string) {
    const hashedPassword = await hash(password, 10)
    return hashedPassword
}

export async function validatePassword(password:string ,hashedPassword:string) {
    const comparison = compare(password, hashedPassword)
    return comparison
}