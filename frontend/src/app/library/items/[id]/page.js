import React from 'react'

const page = async ({ params }) => {

  const { id } = await params

  return (
    <div>
      Item id: {id}
    </div>
  )
}

export default page
