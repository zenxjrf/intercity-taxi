import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { Star, ChevronLeft, Send } from 'lucide-react'

export default function ReviewPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { createReview } = useStore()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return
    
    setLoading(true)
    const result = await createReview({
      order_id: parseInt(orderId),
      rating,
      comment
    })
    setLoading(false)
    
    if (result.success) {
      setSubmitted(true)
      setTimeout(() => {
        navigate('/orders')
      }, 2000)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-tg-secondaryBg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Спасибо за оценку!</h2>
          <p className="text-tg-hint">Ваш отзыв помогает нам стать лучше</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tg-secondaryBg">
      {/* Header */}
      <div className="bg-tg-bg p-4 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate('/orders')} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Оцените поездку</h1>
      </div>

      <div className="p-6">
        {/* Rating Stars */}
        <div className="bg-tg-bg rounded-xl p-6 mb-4">
          <p className="text-center text-tg-hint mb-4">Как вы оцениваете поездку?</p>
          
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-2 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          
          <p className="text-center font-medium text-lg">
            {rating === 1 && 'Плохо'}
            {rating === 2 && 'Ниже среднего'}
            {rating === 3 && 'Нормально'}
            {rating === 4 && 'Хорошо'}
            {rating === 5 && 'Отлично!'}
          </p>
        </div>

        {/* Comment */}
        <div className="bg-tg-bg rounded-xl p-4 mb-4">
          <label className="block text-sm text-tg-hint mb-2">
            Комментарий (необязательно)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Расскажите о вашей поездке..."
            rows={4}
            className="w-full p-3 bg-tg-secondaryBg rounded-lg text-tg-text resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || loading}
          className="w-full py-4 bg-tg-button text-tg-buttonText rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            'Отправка...'
          ) : (
            <>
              <Send className="w-5 h-5" />
              Отправить отзыв
            </>
          )}
        </button>
      </div>
    </div>
  )
}
