import React, {RefObject, createRef} from 'react'
import MaskedInput from 'react-text-mask'
import {findDOMNode} from 'react-dom'

import PhoneFieldControlProps from './PhoneFieldControlProps'
import PhoneFieldControlState from './PhoneFieldControlState'

import PhoneFieldCountry from './PhoneFieldCountry'
import Phone from './Phone'
import {maskArray} from '../mask'

export default class PhoneFieldControl extends React.Component<PhoneFieldControlProps, PhoneFieldControlState> {

  public componentDidUpdate(_props: PhoneFieldControlProps, state: PhoneFieldControlState) {
    if (state.country.mask !== this.state.country.mask && this.props.value) {
      this.setCursorPosition(this.props.value.phoneNumber.length * 2)
    }
  }

  public state: PhoneFieldControlState = {
    focused: false,
    showCountries: false,
    country: this.props.countryFallback,
    selectedCountry: null,
  }

  private containerRef: RefObject<HTMLDivElement> = createRef()

  private inputRef: RefObject<MaskedInput> = createRef()

  private dropdownRef: RefObject<HTMLDivElement> = createRef()

  private optionsRefs: Map<PhoneFieldCountry, RefObject<HTMLDivElement>> = new Map(
    this.props.countries.map((country => [country, createRef()])),
  )

  private onCountryClick = (country: PhoneFieldCountry) => (event: React.MouseEvent) => {
    event.preventDefault()
    this.selectCountry(country)
  }

  private onCountryEnter = (country: PhoneFieldCountry) => (event: React.MouseEvent) => {
    event.preventDefault()
    this.setState({
      selectedCountry: country,
    })
    if (this.props.onCountryEnter) {
      this.props.onCountryEnter(country)
    }
  }

  private onCountryLeave = (country: PhoneFieldCountry) => (event: React.MouseEvent) => {
    event.preventDefault()
    this.setState({
      selectedCountry: null,
    })
    if (this.props.onCountryLeave) {
      this.props.onCountryLeave(country)
    }
  }

  private get inputField(): HTMLInputElement | null {
    if (!this.inputRef.current) {
      return null
    }
    return findDOMNode(this.inputRef.current) as HTMLInputElement
  }

  private focusInput() {
    if (this.inputField !== null) {
      this.inputField.focus()
    }
  }

  private onFlagClick: React.MouseEventHandler = (event: React.MouseEvent) => {
    event.preventDefault()
    this.focusInput()
    this.onCountriesShow()
  }

  private onFlagMouseDown: React.MouseEventHandler = (event: React.MouseEvent) => {
    event.preventDefault()
    this.focusInput()
  }

  private selectCountry: (country: PhoneFieldCountry) => void = (country) => {
    const phoneNumber = this.props.value ? this.props.value.phoneNumber : ''
    const currentCountryMask = this.state.country.mask.replace(/\D/g, '')
    const newCountryMask = country.mask.replace(/\D/g, '')
    if (this.props.onChange) {
      const newValue = new Phone(
        `+${newCountryMask}${phoneNumber.replace(/\D/g, '').substr(currentCountryMask.length)}`,
        this.props.countries,
        this.props.countryFallback,
      )
      this.props.onChange(newValue)
    }
    this.onCountriesHide()
    this.focusInput()
    this.setState({
      country,
    })
  }

  private setCursorPosition: (position: number) => void = (position) => {
    if (this.inputField !== null) {
      this.inputField.setSelectionRange(position, position)
    }
  }

  private onCountriesShow: () => void = () => {
    if (this.props.onCountriesShow) {
      this.props.onCountriesShow()
    }
    this.setState({
      showCountries: true,
    })
  }

  private onCountriesHide: () => void = () => {
    if (this.props.onCountriesHide) {
      this.props.onCountriesHide()
    }
    this.setState({
      showCountries: false,
    })
  }

  private onChange: React.ChangeEventHandler<HTMLInputElement> = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    const value = new Phone(
      event.currentTarget.value,
      this.props.countries,
      this.props.countryFallback,
    )
    if (this.props.onChange) {
      this.props.onChange(value)
    }
    this.setState({
      country: value.country,
    })
  }

  private onFocus: React.FocusEventHandler = (event: React.FocusEvent) => {
    event.preventDefault()
    this.setState({
      focused: true,
    })
    if (this.props.onFocus) {
      this.props.onFocus()
    }
  }

  private onBlur: React.FocusEventHandler = (event: React.FocusEvent) => {
    event.preventDefault()
    this.setState({
      focused: false,
    })
    if (this.props.hideOnBlur) {
      this.setState({
        showCountries: false,
      })
    }
    if (this.props.onBlur) {
      this.props.onBlur()
    }
  }

  private onKeyDown: React.KeyboardEventHandler = (event: React.KeyboardEvent) => {
    if (!this.state.showCountries && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault()
      this.onCountriesShow()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      this.setState({
        selectedCountry: this.nextCountry,
      })
      const countryRef = this.optionsRefs.get(this.nextCountry || this.state.country)
      if (!countryRef || !this.dropdownRef) {
        return
      }
      if (countryRef && this.dropdownRef) {
        this.scrollToCountry(this.dropdownRef, countryRef)
      }
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      this.setState({
        selectedCountry: this.prevCountry,
      })
      const countryRef = this.optionsRefs.get(this.prevCountry || this.state.country)
      if (!countryRef || !this.dropdownRef) {
        return
      }
      if (countryRef && this.dropdownRef) {
        this.scrollToCountry(this.dropdownRef, countryRef)
      }
      return
    }
    if (this.state.showCountries && event.key === 'Enter') {
      event.preventDefault()
      this.selectCountry(this.state.selectedCountry === null ? this.state.country : this.state.selectedCountry)
    }
  }

  private scrollToCountry: (container: RefObject<HTMLDivElement>, country: RefObject<HTMLDivElement>) => void = (container, country) => {
    const containerElement = findDOMNode(container.current) as HTMLDivElement
    const countryElement = findDOMNode(country.current) as HTMLDivElement
    if (!containerElement || !countryElement) {
      return
    }
    const containerBoundingRect = containerElement.getBoundingClientRect()
    const countryBoundingRect = countryElement.getBoundingClientRect()
    const countryOffset = countryElement.offsetTop
    const scrollOffset = containerElement.scrollTop
    const countryHeigher = countryOffset < scrollOffset
    const countryLower = countryOffset + countryBoundingRect.height > scrollOffset + containerBoundingRect.height
    if (countryHeigher) {
      containerElement.scrollTo({top: countryOffset})
    }
    if (countryLower) {
      containerElement.scrollTo({top: countryOffset + countryBoundingRect.height - containerBoundingRect.height})
    }
  }

  private get nextCountry(): PhoneFieldCountry | null {
    const {countries} = this.props
    const selectedId: number = countries.findIndex(country => this.state.selectedCountry === null ? country === this.state.country : country === this.state.selectedCountry)
    const nextId = selectedId + 1 >= countries.length ? 0 : selectedId + 1
    return countries[nextId]
  }

  private get prevCountry(): PhoneFieldCountry | null {
    const {countries} = this.props
    const selectedId: number = countries.findIndex(country => this.state.selectedCountry === null ? country === this.state.country : country === this.state.selectedCountry)
    const nextId = selectedId <= 0 ? countries.length - 1 : selectedId - 1
    return countries[nextId]
  }

  private getMask: (phoneNumber: string) => maskArray = (phoneNumber = '') => {
    const {countries} = this.props
    const clearMasks = countries
      .map(country => country.mask.slice(1))
      .sort((a, b) => b.length - a.length)
    const mask: maskArray = ['+']
    const clearValue = phoneNumber.replace(/\D/g, '')
    if (clearValue === '') {
      return mask
    }
    const selectedMask = clearMasks.find(clearMask => clearValue.startsWith(clearMask.replace(/\D/g, '').slice(0, clearValue.length)))
    if (!selectedMask) {
      return this.getMask(phoneNumber.slice(0, -1))
    }
    return mask.concat(selectedMask.split('').map(char => char === 'd' ? /\d/ : new RegExp(char)))
  }

  public render() {
    return this.props.children({
      country: this.state.country,
      countries: this.props.countries.map((country) => ({
        ...country,
        current: country === this.state.country,
        selected: country === this.state.selectedCountry,
        onClick: this.onCountryClick(country),
        onMouseEnter: this.onCountryEnter(country),
        onMouseLeave: this.onCountryLeave(country),
      })),
      focused: this.state.focused,
      showCountries: this.state.showCountries,
      value: this.props.value || new Phone('', this.props.countries, this.props.countryFallback),
      containerRef: this.containerRef,
      inputRef: this.inputRef,
      dropdownRef: this.dropdownRef,
      optionsRefs: this.optionsRefs,
      getMask: this.getMask,
      onFlagClick: this.onFlagClick,
      onFlagMouseDown: this.onFlagMouseDown,
      onCountriesShow: this.onCountriesShow,
      onCountriesHide: this.onCountriesHide,
      onChange: this.onChange,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onKeyDown: this.onKeyDown,
    })
  }

}