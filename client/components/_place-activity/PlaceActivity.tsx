// import CardContent from '@mui/material/CardContent'
// import CardHeader from '@mui/material/CardHeader'
// import React from 'react'
//
// import { Item } from '@/api/types/Activity'
//
// import ActivityList from '@/components/activity-list'
//
// interface PlaceActivityProps {
//     title?: string
//     placeId?: string
//     activity?: Item[]
// }
//
// const PlaceActivity: React.FC<PlaceActivityProps> = ({ title, activity }) => (
//     <>
//         <CardHeader
//             title={
//                 title ? `${title} - история активности` : 'История активности'
//             }
//             titleTypographyProps={{
//                 component: 'h2',
//                 fontSize: 18
//             }}
//             sx={{ mb: -2 }}
//         />
//         <CardContent sx={{ mb: -3 }}>
//             <ActivityList
//                 activities={activity}
//                 hidePlaceName={true}
//                 hideBorder={true}
//             />
//         </CardContent>
//     </>
// )
//
// export default PlaceActivity
