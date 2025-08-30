import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.redirect('/auth/signup')
}

export async function POST() {
  return NextResponse.redirect('/auth/signup')
}