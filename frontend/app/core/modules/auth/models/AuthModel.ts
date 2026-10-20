export interface IUser {
	id: number
	username: string
	full_name?: string
	role: string
	email?: string
	phone?: string
}

export interface IAuthResponse {
	access_token: string
	refresh_token?: string
	token_type?: string
	user?: IUser
	role?: string
}
