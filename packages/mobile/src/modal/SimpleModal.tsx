import React, {FunctionComponent, Fragment} from 'react'

import {
  css,
  Pos,
  Card,
  Modal,
  SimpleTransition,
  SimpleTransitionProps,
  Icon,
  Box,
} from '@qiwi/pijma-core'

const contentTransition: FunctionComponent<SimpleTransitionProps> = (props) => <SimpleTransition {...props}/>

contentTransition.defaultProps = {
  timeout: {
    enter: 370,
    exit: 250,
  },
  enterClassName: (timeout: number) => css({
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
    transition: `opacity ${timeout}ms ease, transform ${timeout}ms ease`,
  }),
  exitClassName: (timeout: number) => css({
    opacity: 0,
    transform: 'translate3d(0, -100%, 0)',
    transition: `opacity ${timeout}ms ease, transform ${timeout}ms ease`,
  }),
}

const backdropTransition: FunctionComponent<SimpleTransitionProps> = (props) => <SimpleTransition {...props}/>

backdropTransition.defaultProps = {
  timeout: {
    enter: 370,
    exit: 250,
  },
  enterClassName: (timeout: number) => css({
    opacity: 1,
    transition: `opacity ${timeout}ms ease`,
  }),
  exitClassName: (timeout: number) => css({
    opacity: 0,
    transition: `opacity ${timeout}ms ease`,
  }),
}

interface SimpleModalProps {
  show: boolean
  closable?: boolean
  escapeClose?: boolean
  backdropClose?: boolean
  stub?: boolean
  zIndex?: number
  onShow?: () => void
  onHide?: () => void
}

const SimpleModal: FunctionComponent<SimpleModalProps> = ({
  stub,
  children,
  show,
  escapeClose,
  onShow,
  onHide,
  backdropClose,
  zIndex = 10050,
  closable,
}) => (
  stub ? (
    <Box display="none">
      {children}
    </Box>
  ) : (
    <Modal
      show={show}
      keyboard={escapeClose}
      onShow={onShow}
      onHide={onHide}
      onBackdropClick={backdropClose ? onHide : undefined}
      transition={contentTransition}
      backdropTransition={backdropTransition}
      renderBackdrop={(backdropProps) => (
        <Pos type="fixed" zIndex="auto" top={0} right={0} bottom={0} left={0} {...backdropProps}>
          <Card bg="rgba(255, 255, 255, 0.96)" width={1} height={1}/>
        </Pos>
      )}
      renderDialog={(dialogProps) => (
        <Pos
          type="fixed"
          top={0}
          bottom={0}
          left={0}
          right={0}
          height="100%"
          overflow="auto"
          zIndex={zIndex}
          {...dialogProps}
        >
          <Pos type="relative" width={1} height={1}>
            <Card bg="#fff" p={6} width={1} height={1} overflow="auto">
              <Fragment>
                {closable && onHide ? (
                  <Pos
                    type="absolute"
                    top={6}
                    right={6}
                    width={6}
                    height={6}
                    cursor="pointer"
                    onClick={onHide}
                    children={<Icon name="cross" color="#000"/>}
                  />
                ) : (
                  null
                )}
                {children}
              </Fragment>
            </Card>
          </Pos>
        </Pos>
      )}
    />
  )
)

export default SimpleModal
