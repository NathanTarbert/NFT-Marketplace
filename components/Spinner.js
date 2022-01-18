import React, { useState } from 'react'
import { Triangle } from  'react-loader-spinner'

function Loading() {   
        
    return (
        <div align='center'>
            <Triangle
                heigth="100"
                width="100"
                color='grey'
                arialLabel='loading'
            />
        </div>
    )
}

export default Loading
