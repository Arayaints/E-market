export interface IUser {
	id: number
	username: string
	full_name?: string
	role: string
	email?: string
	phone?: string
	citizen_id?: string
	id_card?: string
	assigned_markets?: Array<{
		id: number
		slug: string
		code: string
		name: string
		district: string
	}>
}

export interface IAuthResponse {
	access_token: string
	refresh_token?: string
	token_type?: string
	user?: IUser
	role?: string
}
