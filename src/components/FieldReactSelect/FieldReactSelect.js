import React from 'react'
import { Colors } from '../../colors'

const ReactSelectAdapter = (props) => {
  const {
    input,
    searchable = false,
    ...rest
  } = props

  if (typeof window === 'undefined') {
    return null
  }
  const { default: Select } = require('react-select') // eslint-disable-line global-require

  const determineBorderColor = () => {
    const {
      visited,
      invalid,
      valid,
      pristine
    } = props.meta
    switch (true) {
      case visited && invalid:
        return Colors.error
      case !pristine && invalid:
        return Colors.error
      case valid:
        return Colors.success
      default:
        return Colors.darkGrey
    }
  }


  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      fontFamily: 'Nunito Sans'
    }),
    singleValue: (provided, state) => ({
      ...provided,
      fontFamily: 'Nunito Sans'
    }),
    control: (base) => ({
      ...base,
      fontFamily: 'Nunito Sans',
      height: 50,
      borderColor: determineBorderColor()
    })

  }
  return (
    <Select
      {...input}
      {...rest}
      searchable={searchable}
      styles={customStyles}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary25: '#e7e7e7',
          primary: Colors.primary,
        },
      })}
    />
  )
}

export default ReactSelectAdapter
