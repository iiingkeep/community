import './Header.css'

const Header = ({leftChild, menu, rightChild}) => {
  return (
    <div className='Header'>
      <div className='HeaderLeft'>{leftChild}</div>
      <div className='HeaderMenu'>{menu}</div>
      <div className='HeaderRight'>{rightChild}</div>
    </div>
  )
}

export default Header;