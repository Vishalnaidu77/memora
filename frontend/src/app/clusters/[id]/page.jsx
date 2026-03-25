import useItem from '@/app/hooks/useItem'
import { useRouter } from 'next/router'
import React from 'react'

const page = () => {

    const { clusterGroups } = useItem()
    const router = useRouter()

    console.log(clusterGroups);

  return (
    <div>
      
    </div>
  )
}

export default page
