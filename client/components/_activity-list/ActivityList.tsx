// import Box from '@mui/material/Box'
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Typography from '@mui/material/Typography'
// import Image from 'next/image'
// import Link from 'next/link'
// import React, { useState } from 'react'
// import Gallery from 'react-photo-gallery'
//
// import { IMG_HOST } from '@/api/api'
// import { ActivityTypes, Item } from '@/api/types/Activity'
//
// import PhotoLightbox from '@/components/photo-lightbox'
// import UserAvatar from '@/components/user-avatar'
//
// import { categoryImage } from '@/functions/categories'
// import { formatDate } from '@/functions/helpers'
//
// interface PlacesListProps {
//     perPage?: number
//     loading?: boolean
//     activities?: Item[]
//     hidePlaceName?: boolean
//     hideBorder?: boolean
// }
//
// const ActivityList: React.FC<PlacesListProps> = ({
//     perPage,
//     activities,
//     loading,
//     hidePlaceName,
//     hideBorder
// }) => (
//     <>
//         {activities?.map((item, index) =>
//             hideBorder ? (
//                 <Box
//                     key={index}
//                     sx={{ mb: 2 }}
//                 >
//                     <ActivityListItem
//                         item={item}
//                         hidePlaceName={hidePlaceName}
//                     />
//                 </Box>
//             ) : (
//                 <Card
//                     key={index}
//                     sx={{ mb: 1.5 }}
//                 >
//                     <CardContent>
//                         <ActivityListItem
//                             item={item}
//                             hidePlaceName={hidePlaceName}
//                         />
//                     </CardContent>
//                 </Card>
//             )
//         )}
//     </>
// )
//
// interface ActivityListItemProps {
//     item: Item
//     hidePlaceName?: boolean
// }
//
// const ActivityListItem: React.FC<ActivityListItemProps> = ({
//     item,
//     hidePlaceName
// }) => {
//     const [showLightbox, setShowLightbox] = useState<boolean>(false)
//     const [photoIndex, setPhotoIndex] = useState<number>()
//
//     const handleCloseLightbox = () => {
//         setShowLightbox(false)
//     }
//
//     const handlePhotoClick = (event: React.MouseEvent, photos: any) => {
//         setPhotoIndex(photos.index)
//         setShowLightbox(true)
//     }
//
//     return (
//         <>
//             <UserAvatar
//                 size={'medium'}
//                 user={item.author}
//                 text={
//                     <>
//                         {formatDate(item.created?.date)}
//                         {' • '}
//                         {
//                             {
//                                 [ActivityTypes.Edit]: 'Материал отредактирован',
//                                 [ActivityTypes.Place]: 'Добавлено на карту',
//                                 [ActivityTypes.Photo]: 'Загрузил(а) фотографии',
//                                 [ActivityTypes.Rating]: 'Поставил(а) оценку'
//                             }[item.type]
//                         }
//                         {item.type === ActivityTypes.Edit &&
//                         item.place?.difference ? (
//                             <>
//                                 {' ('}
//                                 <span
//                                     className={
//                                         item.place.difference > 0
//                                             ? 'green'
//                                             : 'red'
//                                     }
//                                 >
//                                     {item.place.difference > 0 && '+'}
//                                     {item.place.difference}
//                                 </span>
//                                 {')'}
//                             </>
//                         ) : (
//                             ''
//                         )}
//                     </>
//                 }
//             />
//
//             {!hidePlaceName && (
//                 <Typography
//                     gutterBottom
//                     variant={'h3'}
//                     sx={{ lineHeight: '18px', mt: 1 }}
//                 >
//                     <Link
//                         href={`/places/${item.place?.id}`}
//                         title={item.place?.title}
//                         style={{
//                             color: 'rgba(0, 0, 0, 0.87)',
//                             textDecoration: 'none'
//                         }}
//                     >
//                         <Image
//                             style={{
//                                 float: 'left',
//                                 marginLeft: '2px',
//                                 marginRight: '4px',
//                                 marginTop: '1px'
//                             }}
//                             src={categoryImage(item.place?.category?.name).src}
//                             alt={item.place?.category?.title || ''}
//                             width={16}
//                             height={18}
//                         />
//                         {item.place?.title}
//                     </Link>
//                 </Typography>
//             )}
//
//             {(item.type === ActivityTypes.Place ||
//                 item.type === ActivityTypes.Edit) && (
//                 <Typography
//                     variant={'body1'}
//                     color={'text.primary'}
//                     gutterBottom={false}
//                 >
//                     {item.place?.content
//                         ? `${item.place.content}...`
//                         : 'Нет данных для отображения'}
//                 </Typography>
//             )}
//
//             {!!item.photos?.length && (
//                 <Box sx={{ mt: 1 }}>
//                     <Gallery
//                         photos={item.photos?.map((photo) => ({
//                             height: photo.height,
//                             src: `${IMG_HOST}photo/${photo.placeId}/${photo.filename}.${photo.extension}`,
//                             width: photo.width
//                         }))}
//                         onClick={handlePhotoClick}
//                     />
//                     <PhotoLightbox
//                         photos={item.photos}
//                         photoIndex={photoIndex}
//                         showLightbox={showLightbox}
//                         onChangeIndex={setPhotoIndex}
//                         onCloseLightBox={handleCloseLightbox}
//                     />
//                 </Box>
//             )}
//         </>
//     )
// }
//
// export default ActivityList
