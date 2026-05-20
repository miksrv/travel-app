import type { GetServerSidePropsResult } from 'next'

export const getServerSideProps = async (): Promise<GetServerSidePropsResult<object>> => ({
    notFound: true
})

export default function NotFoundCatchAll() {
    return null
}
